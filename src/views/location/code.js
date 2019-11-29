import React from 'react';
import { Breadcrumb, Layout, Upload, Icon, Button, Row, Col } from 'antd';
import queryString from 'query-string';
const { Content } = Layout;

class Shape extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showDragger: true, //Dragger组件的显示
      uploading: false, //上传中的表示符
      fileList: [], //存放上传的图片
      base64: null, //存放base64加密的图片数据
    }
    this.handleUpload = this.handleUpload.bind(this);
  }
  getBase64(img, callback) {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  }
  handleUpload = () => { //点击上传按钮之后的操作
    new Promise((resolve, reject) => {
      var reader = new FileReader();
      reader.readAsDataURL(this.state.fileList[0]);
      reader.addEventListener("load", function () {
        resolve(reader.result);
      }, false);
    })
      .then(res => {
        const body = {
          img: res,
          category: 'qrcode',
          params: '{}',
        };
        this.setState({
          uploading: true,
          base64: res,
        });
        fetch("http://10.3.242.229:5000/localization/code", {
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
            console.log(res.results[2]);
          })
          .catch(err => {
            console.log(err);
          });
      });
  };
  render() {
    const props = {
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
              base64: res,
              fileList: [...state.fileList, file],
              showDragger: false,
            }));
            return false;
          })
      },
    };
    const uploadButton = (
      <React.Fragment>
        <Icon type="plus" />
        <div className="ant-upload-text">上传</div>
      </React.Fragment>
    );
    return (
      <Content style={{ margin: '10px 16px' }}>
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item>定位</Breadcrumb.Item>
          <Breadcrumb.Item>二维码识别</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
          <Upload {...props}>
            {this.state.showDragger
              ? uploadButton
              : <img src={this.state.base64} alt="照片" style={{ width: "25%", }} />}
          </Upload>
          <Button
            type="primary"
            onClick={this.handleUpload}
            disabled={this.state.fileList.length === 0}
            loading={this.state.uploading}
            style={{ marginTop: 16 }}
          >
            {this.state.uploading ? '上传中' : '开始上传'}
          </Button>
        </div>
      </Content >
    );
  }
}

export default Shape;
