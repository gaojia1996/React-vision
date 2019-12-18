import React from 'react';
import './App.css';
import { Layout, Menu, Icon } from 'antd';
import Shape from './views/location/shape';
import Code from './views/location/code';
import Bar from './views/location/bar';
import Feature from './views/location/feature';

const { Header, Footer, Sider } = Layout;
const { SubMenu } = Menu;

class App extends React.Component {
  rootSubmenuKeys = ['classfication', 'location', 'segmentation', 'OCR', 'measurement'];
  state = {
    collapsed: false,
    openKeys: sessionStorage.getItem('openKeys') ? [sessionStorage.getItem('openKeys')] : ['location'],
    selectedKeys: sessionStorage.getItem('selectedKeys') ? sessionStorage.getItem('selectedKeys') : ['3'],
  };

  onCollapse = collapsed => { //左侧导航栏的缩小形式
    this.setState({ collapsed });
  };

  onOpenChange = openKeys => { //使得导航栏只展开当前父级菜单——简洁的菜单栏
    const latestOpenKey = openKeys.find(key => this.state.openKeys.indexOf(key) === -1); //获取最新的展开菜单名称
    if (this.rootSubmenuKeys.indexOf(latestOpenKey) === -1) { //仍展示或者收起当前的菜单栏
      this.setState({ openKeys });
    } else { //更改展开的菜单栏内容
      sessionStorage.setItem('openKeys', [latestOpenKey])
      this.setState({
        openKeys: latestOpenKey ? [latestOpenKey] : [],
      });
    }
  };

  onSelect = selectedKeys => { //使得选中的菜单显示active
    sessionStorage.setItem('selectedKeys', [selectedKeys.selectedKeys]);
    this.setState({
      selectedKeys: selectedKeys.selectedKeys,
    });
  }

  showBody() {
    if (this.state.selectedKeys[0] === '3') {
      return <Code />;
    } else if (this.state.selectedKeys[0] === '4') {
      return <Bar />;
    } else if (this.state.selectedKeys[0] === '5') {
      return <Shape />;
    } else if (this.state.selectedKeys[0] === '6') {
      return <Feature />;
    } else {
      return null;
    }
  }

  render() {
    return (
      <Layout style={{ minHeight: '100vh', minWidth: '100vh' }}>
        <Sider
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
          }}>
          <div className="logo" />
          <Menu theme="dark" selectedKeys={this.state.selectedKeys} openKeys={this.state.openKeys} onSelect={this.onSelect} onOpenChange={this.onOpenChange} mode="inline">
            <SubMenu
              key="classfication"
              title={
                <span>
                  <Icon type="border-inner" />
                  <span>分类</span>
                </span>
              }
            >
              <Menu.Item key="0">是否存在焊缝</Menu.Item>
              <Menu.Item key="1">是否存在缺陷</Menu.Item>
              <Menu.Item key="2">板子型号判断</Menu.Item>
            </SubMenu>
            <SubMenu
              key="location"
              title={
                <span>
                  <Icon type="pushpin" />
                  <span>定位</span>
                </span>
              }
            >
              <Menu.Item key="3">二维码识别</Menu.Item>
              <Menu.Item key="4">条形码识别</Menu.Item>
              <Menu.Item key="5">形状探测器</Menu.Item>
              <Menu.Item key="6">模板匹配</Menu.Item>
            </SubMenu>
            <SubMenu
              key="segmentation"
              title={
                <span>
                  <Icon type="block" />
                  <span>分割</span>
                </span>
              }
            >
              <Menu.Item key="7">焊盘检测</Menu.Item>
              <Menu.Item key="8">划痕缺陷检测</Menu.Item>
            </SubMenu>
            <SubMenu
              key="OCR"
              title={
                <span>
                  <Icon type="search" />
                  <span>OCR</span>
                </span>
              }
            >
              <Menu.Item key="9">字符检测</Menu.Item>
            </SubMenu>
            <SubMenu
              key="measurement"
              title={
                <span>
                  <Icon type="cluster" />
                  <span>测量</span>
                </span>
              }
            >
              <Menu.Item key="10">长宽高面积周长</Menu.Item>
              <Menu.Item key="11">旋转角度</Menu.Item>
              <Menu.Item key="12">元件距离</Menu.Item>
            </SubMenu>
          </Menu>
        </Sider>
        <Layout style={{ marginLeft: 200 }}>
          <Header style={{ background: '#fff', padding: 0 }} />
          {this.showBody()}
          <Footer style={{ textAlign: 'center' }}>Computer Vision ©2019 Created by ICC</Footer>
        </Layout>
      </Layout>
    );
  }
}

export default App;
