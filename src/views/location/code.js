import React from 'react';
import { Breadcrumb, Layout, Upload, Icon, Button, message, Tabs, Row, Col } from 'antd';
import queryString from 'query-string';
import{ Stage, Layer, Rect } from 'react-konva';
const { Content } = Layout;
const { TabPane } = Tabs;

class Code extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showDragger: true, //上传照片在框框中的显示表示
      uploading: false, //按钮 上传中/开始上传 的表示符
      base64: null, //存放base64加密的图片数据
      resultShow: false, //结果展示与否
      result: null, //存储返回结果
      showButton: true, //按钮变灰与否
      width: 0,
      height: 0,
      file: null,
    }
    this.handleUpload = this.handleUpload.bind(this);
    this.canvas = React.createRef();
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
    const url = "http://10.3.242.229:5000/localization/code";
    const body = {
      img: this.state.base64,
      category: 'qrcode',
      params: '{}',
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
          resultShow: true,
          result: res,
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
  render() {
    const props = {
      action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
      listType: "picture-card",
      name: "avatar",
      className: "avatar-uploader",
      showUploadList: false,
      beforeUpload: file => {
        new Promise((resolve, reject) => {
          this.setState({
            file: file,
          })
          var reader = new FileReader();
          console.log(file)
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
            return (res);
          })
          .then((res) => {
            var img = new Image();
            img.src = res;
            img.onload = () => {
              this.setState({
                width: img.width,
                height: img.height,
              });
            }; //将图片原本的宽高存入state
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
    // if(this.state.resultShow){
    //   console.log('test')
    //   var canvas = document.getElementById('canvas');
    //   if (canvas.getContext) {
    //     console.log('test2')
    //     var ctx = canvas.getContext('2d');
    //     ctx.strokeRect(84, 241, 500, 507);
    //   }
    // }
    return (
      <Content style={{ margin: '10px 16px' }}>
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item>定位</Breadcrumb.Item>
          <Breadcrumb.Item>二维码识别</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
          <Row>
            <Col span={12}>
              <Upload {...props}>
                {this.state.showDragger
                  ? uploadButton
                  : <img src={this.state.base64} alt="照片" style={{ width: "50%", }} />}
              </Upload>
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

                        <canvas id="canvas" ref={this.canvas} width={this.state.width} height={this.state.height} style={{ backgroundImage: "url(" + this.state.base64 + ")" }}>
                        </canvas>

                        <Stage width={this.state.width} height={this.state.height} style={{ backgroundImage: "url(" + this.state.base64 + ")" }}>
                          <Layer>
                            <Rect
                            ref='rect'
                            x='84'
                            y='241'
                            width='505'
                            height='507'
                            fill="red"
                            shadowBlur={10}
                            />
                          </Layer>
                        </Stage>
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

export default Code;
