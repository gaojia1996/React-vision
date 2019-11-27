import React from 'react';
import { Breadcrumb, Layout, Upload, Icon, message, Input, } from 'antd';
const { Dragger } = Upload;
const { Content } = Layout;

class Shape extends React.Component {

  state = {
    uploadStatus: false, //默认用户未上传图片
    fileList: [],
  }

  onChange = info => {
    const { status } = info.file;
    console.log(status);
    // if (status !== 'uploading') {
    //   console.log(info.file, info.fileList);
    // }
    if (status === 'done') {
      this.setState({
        uploadStatus: true, //默认用户未上传图片
        fileList: info.file,
      });
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === 'error') {
      console.log(info.file)
      message.error(`${info.file.name} file upload failed.`);
    }
  }

  handleSubmit = e => {
    console.log(e.target.value);
    let data = new FormData()
    data.append('img', e.target.value);
    console.log(data)
    const submitPath = "http://10.3.242.229:5000/localization/shape";
    fetch(submitPath, {
      method: "POST",
      body: data
    })
      .then(response => response.text())
      .then(json => {
        console.log(json)
      })
      .catch(err => {
        console.log(err)
      })
  }

  render() {
    const props = {
      name: 'file',
      multiple: true,
      action: 'http://10.3.242.229:5000/localization/shape',
      listType: "picture",
      headers: {
        'cache-control': 'no-cache',
        'Postman-Token': '5d6e4680-3712-423b-8025-f9528583150e,1cec4615-601d-498a-a090-234f489b8d40',
        'Cache-Control': 'no-cache',
        "Accept": '*/*',
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "*",
      },
      onChange: this.onChange,
    };
    return (
      <Content style={{ margin: '10px 16px' }}>
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item>定位</Breadcrumb.Item>
          <Breadcrumb.Item>二维码识别</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
          {this.state.uploadStatus ?
            <img url="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png" alt="照片">{console.log(this.state.fileList['response']['url'])}</img>
            :
            <React.Fragment>
              <Dragger {...props}>
                <p className="ant-upload-drag-icon">
                  <Icon type="inbox" />
                </p>
                <p className="ant-upload-text">点击上传图片</p>
                <p className="ant-upload-hint">请勿上传机密图片</p>
              </Dragger>
              <Input id="imgUrl" name="from1" type="file" accept="image/*" onChange={this.handleSubmit.bind(this)} />

            </React.Fragment>
          }
        </div>
      </Content >
    );
  }
}

export default Shape;
