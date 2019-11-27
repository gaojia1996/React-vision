import React from 'react';
import { Breadcrumb, Layout } from 'antd';
const { Content } = Layout;

class Shape extends React.Component {

  render() {
    return (
      <Content style={{ margin: '10px 16px' }}>
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item>定位</Breadcrumb.Item>
          <Breadcrumb.Item>形状探测器</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>shape</div>
      </Content>
    );
  }
}

export default Shape;
