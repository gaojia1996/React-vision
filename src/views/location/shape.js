import React from 'react';
import { Breadcrumb, Layout, Upload, Icon, Button, } from 'antd';
import queryString from 'query-string';
const { Dragger } = Upload;
const { Content } = Layout;

class Shape extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileList: [],
      uploading: false,
    }
    this.handleUpload = this.handleUpload.bind(this);
  }
  handleUpload = () => {
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
          params: null,
        };
        console.log(res);
        this.setState({
          uploading: true,
        });
        fetch("http://10.3.242.229:5000/localization/shape", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            "Accept": '*/*',
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "*",
          },
          body: queryString.stringify(body),
        })
      });
  };
  render() {
    const props = {
      beforeUpload: file => {
        this.setState(state => ({
          fileList: [...state.fileList, file],
        }));
        return false;
      },
      onRemove: file => {
        this.setState(state => {
          const index = state.fileList.indexOf(file);
          const newFileList = state.fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
          };
        });
      },
    };
    return (
      <Content style={{ margin: '10px 16px' }}>
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item>定位</Breadcrumb.Item>
          <Breadcrumb.Item>形状探测器</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
          {this.state.uploading ?
            <React.Fragment>
              <p>success</p>
              <img url="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png" alt="照片" />
            </React.Fragment>
            :
            <React.Fragment>
              <Dragger {...props}>
                <p className="ant-upload-drag-icon">
                  <Icon type="inbox" />
                </p>
                <p className="ant-upload-text">点击上传图片</p>
                <p className="ant-upload-hint">请勿上传机密图片</p>
              </Dragger>
              <Button
                type="primary"
                onClick={this.handleUpload}
                disabled={this.state.fileList.length === 0}
                loading={this.state.uploading}
                style={{ marginTop: 16 }}
              >
                {this.state.uploading ? 'Uploading' : 'Start Upload'}
              </Button>
            </React.Fragment>
          }
        </div>
      </Content >
    );
  }
}

export default Shape;
