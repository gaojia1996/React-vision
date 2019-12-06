import React from 'react';
import { Breadcrumb, Layout, Upload, Icon, Button, message, Tabs, Row, Col, Select, InputNumber } from 'antd';
import queryString from 'query-string';
const { Content } = Layout;
const { TabPane } = Tabs;
const { Option } = Select;

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
      defaultKey: "circle", //默认选择的筛选形状
      min_dist: 20,
      param1: 100,
      param2: 100,
      min_radius: 0,
      max_radius: 0,
      thresh: 127,
      epsilon_rate: 0.02,
      width: 0, //原图图的宽
      height: 0, //原图的高
      img: null, //新宽高的image对象
    }
    this.handleUpload = this.handleUpload.bind(this);
    this.onChangeSelect = this.onChangeSelect.bind(this);
    this.onChangeMinDist = this.onChangeMinDist.bind(this);
    this.onChangeParam1 = this.onChangeParam1.bind(this);
    this.onChangeParam2 = this.onChangeParam2.bind(this);
    this.onChangeMinRadius = this.onChangeMinRadius.bind(this);
    this.onChangeMaxRadius = this.onChangeMaxRadius.bind(this);
    this.onChangeThresh = this.onChangeThresh.bind(this);
    this.onChangeEpsionRate = this.onChangeEpsionRate.bind(this);
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
    const paramsCircle = {
      min_dist: this.state.min_dist,
      param1: this.state.param1,
      param2: this.state.param2,
      min_radius: this.state.min_radius,
      max_radius: this.state.max_radius,
    }
    const paramPolygon = {
      thresh: this.state.thresh,
      epsilon_rate: this.state.epsilon_rate,
      required_cls: this.state.defaultKey,
    }
    const params = this.state.defaultKey === "circle" ? paramsCircle : paramPolygon;
    const url = "http://10.3.242.229:5000/localization/shape";
    const body = {
      img: this.state.base64,
      category: this.state.defaultKey === "circle" ? "circle" : "polygon",
      params: JSON.stringify(params),
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
  onChangeSelect(value) {
    this.setState({
      defaultKey: value,
      showButton: false,
    });
  }
  onChangeMinDist(value) {
    this.setState({
      min_dist: value,
      showButton: false,
    });
  }
  onChangeParam1(value) {
    this.setState({
      param1: value,
      showButton: false,
    });
  }
  onChangeParam2(value) {
    this.setState({
      param2: value,
      showButton: false,
    });
  }
  onChangeMinRadius(value) {
    this.setState({
      min_radius: value,
      showButton: false,
    });
  }
  onChangeMaxRadius(value) {
    this.setState({
      max_radius: value,
      showButton: false,
    });
  }
  onChangeThresh(value) {
    this.setState({
      thresh: value,
      showButton: false,
    });
  }
  onChangeEpsionRate(value) {
    this.setState({
      epsilon_rate: value,
      showButton: false,
    });
  }
  handleMax(width, height) {
    return (width > height ? width : height);
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
            return res;
          })
          .then((res) => { //将base64之后的数据重新new一个image对象，修改宽、高用于结果中的canvas画图
            var img = new window.Image();
            img.src = res;
            const width = img.width;
            const height = img.height;
            img.width = 500;
            img.height = 500 * height / width;
            img.onload = () => {
              this.setState({
                width: width,
                height: height,
                img: img,
              });
            };
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
    ); console.log(typeof (this.state.width > this.state.height ? this.state.width : this.state.height))
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
                {this.state.showDragger ? null : (
                  <React.Fragment>
                    选择筛选的形状：<Select style={{ width: 120 }} defaultValue={"circle"} onChange={this.onChangeSelect}>
                      <Option value={"circle"} key={"圆形"}>圆形</Option>
                      <Option value={"triangle"} key={"三角形"}>三角形</Option>
                      <Option value={"rectangle"} key={"矩形"}>矩形</Option>
                      <Option value={"square"} key={"正方形"}>正方形</Option>
                      <Option value={"pentagon"} key={"五边形"}>五边形</Option>
                      <Option value={"hexagon"} key={"六边形"}>六边形</Option>
                    </Select>
                    <br />
                    {this.state.defaultKey === "circle" ? (
                      <React.Fragment>
                        最小圆心距：<InputNumber key='min_dist' min={1} defaultValue={this.state.min_dist} onChange={this.onChangeMinDist} />   <br />
                        Canny边缘检测高阈值: <InputNumber key='param1' min={1} max={100} defaultValue={this.state.param1} onChange={this.onChangeParam1} />   <br />
                        圆心检测阈值:<InputNumber key='param2' min={1} max={100} defaultValue={this.state.param2} onChange={this.onChangeParam2} />   <br />
                        允许检测到的圆的最小半径:<InputNumber key='min_radius' defaultValue={this.state.min_radius} min={0} max={this.handleMax(this.state.width, this.state.height)} onChange={this.onChangeMinRadius} />   <br />
                        允许检测到的圆的最大半径: <InputNumber key='max_radius' defaultValue={this.state.max_radius} min={0} max={this.state.width > this.state.height ? this.state.width : this.state.height} onChange={this.onChangeMaxRadius} />   <br />
                      </React.Fragment>
                    ) : (
                        <React.Fragment>
                          二值化阈值：<InputNumber key='thresh' min={0} max={255} step={1} defaultValue={this.state.thresh} onChange={this.onChangeThresh} />   <br />
                          轮廓近似算法相关参数: <InputNumber key='epsilon_rate' defaultValue={this.state.epsilon_rate} min={0.01} max={0.05} step={0.001} onChange={this.onChangeEpsionRate} />   <br />
                        </React.Fragment>
                      )}
                  </React.Fragment>
                )}
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
              {/* {this.state.resultShow ? (
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
              ) : null} */}
            </Col>
          </Row>
        </div>
      </Content >
    );
  }
}

export default Shape;
