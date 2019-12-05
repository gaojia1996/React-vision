import React from 'react';
import { Breadcrumb, Layout, Upload, Icon, Button, message, Tabs, Row, Col, Switch } from 'antd';
import queryString from 'query-string';
const { Content } = Layout;
const { TabPane } = Tabs;

class Shape extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showDragger: true, //上传照片在框框中的显示表示
      uploading: false, //按钮 上传中/开始上传 的表示符
      base64: null, //存放base64加密的图片数据
      resultShow: false, //结果展示与否
      result: null, //存储返回结果
      showButton: true, //按钮变灰与否
      defaultKey: true, //默认过滤图片中的二维码
    }
    this.handleUpload = this.handleUpload.bind(this);
    this.onChange = this.onChange.bind(this);
  }
  getBase64(img, callback) { //回调函数形式获取图片base64格式
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  }
  handleUpload = () => { //点击上传按钮之后的操作
    this.setState({
      resultShow: false,
      uploading: true,
    });
    // const paramsCircle = {
    //   min_dist: 20,
    //   param1: 100,
    //   param2: 100,
    //   min_radius: 0,
    //   max_radius: 0,
    // }
    // const paramPolygon = {
    //   thresh: 127,
    //   epsilon_rate: 0.02,
    //   required_cls: ['rectangle', 'square'],
    // }
    const url = "http://10.3.242.229:5000/localization/code";
    const body = {
      img: this.state.base64,
      category: 'barcode',
      params: '{"filter_qrcode":' + this.state.defaultKey + '}',
    };
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        "Accept": '*/*',
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "*",
      },
      mode: 'cors',
      body: queryString.stringify(body),
    })
      .then((res) => {
        return res.json();
      })
      .then(res => {
        message.success('图片已成功上传至后台~');
        this.setState({
          // resultShow: true,
          // result: res,
          uploading: false,
          showButton: true,
        });
        console.log(res.results);
      })
      .catch(err => {
        this.setState({
          uploading: false,
        });
        message.error('上传至后台发生错误~请重试');
        console.log(err);
      });
  };
  onChange(checked) {
    this.setState({
      defaultKey: checked,
      showButton: false,
      uploading: false,
    });
  }
  render() {
    const props = {
      action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
      listType: "picture-card",
      name: "avatar",
      className: "avatar-uploader",
      showUploadList: false,
      beforeUpload: file => {
        new Promise((resolve, reject) => {
          var reader = new FileReader();
          reader.readAsDataURL(file);
          reader.addEventListener("load", function () {
            resolve(reader.result);
          }, false);
        })
          .then((res) => {
            this.setState(state => ({
              base64: res, //图片base64加密后格式，用于显示图片同时发给后台
              showDragger: false, //上传框框中设置为展示用户上传的图片
              showButton: false,
            }));
            return false;
          });
      },
    };
    const uploadButton = (
      <React.Fragment>
        <p className="ant-upload-drag-icon">
          <Icon type="inbox" />
        </p>
        <p className="ant-upload-text">点击上传图片</p>
        <p className="ant-upload-hint">请勿上传机密图片</p>
      </React.Fragment>
    );
    return (
      <Content style={{ margin: '10px 16px' }}>
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item>定位</Breadcrumb.Item>
          <Breadcrumb.Item>形状探测器</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
          <Row>
            <Col span={12}>
              <Upload {...props}>
                {this.state.showDragger
                  ? uploadButton
                  : <img src={this.state.base64} alt="照片" style={{ width: "50%", }} />}
              </Upload>
              <Row>
                是否过滤图片中的二维码：<Switch checkedChildren="是" unCheckedChildren="否" defaultChecked onChange={this.onChange} />
              </Row>
              <Button
                type="primary"
                onClick={this.handleUpload}
                disabled={this.state.showButton}
                loading={this.state.uploading}
                style={{ marginTop: 16 }}
              >
                {this.state.uploading ? '上传中' : '开始上传'}
              </Button>
            </Col>
            <Col span={12}>
              {this.state.resultShow ? (
                <React.Fragment>
                  <h3>识别结果</h3>
                  <hr />
                  {this.state.result.results[0] === "" ? '上传的图片不含有二维码' :
                    <Tabs defaultActiveKey="1">
                      <TabPane tab="识别内容" key="1">
                        {this.state.result.results[0]}
                      </TabPane>
                      <TabPane tab="二维码定位" key="2">
                        <p>像素点1：[{this.state.result.results[1][0][0][0]}, {this.state.result.results[1][0][0][1]}] </p>
                        <p>像素点2：[{this.state.result.results[1][1][0][0]}, {this.state.result.results[1][1][0][1]}] </p>
                        <p>像素点3：[{this.state.result.results[1][2][0][0]}, {this.state.result.results[1][2][0][1]}] </p>
                        <p>像素点4：[{this.state.result.results[1][3][0][0]}, {this.state.result.results[1][3][0][1]}] </p>
                      </TabPane>
                      <TabPane tab="二维码" key="3">
                        <img src={this.state.result.results[2]} alt="照片" style={{ width: "20%", align: "center" }} />
                      </TabPane>
                    </Tabs>
                  }
                </React.Fragment>
              ) : null}
            </Col>
          </Row>


        </div>
      </Content >
    );
  }
}

export default Shape;
