import React from 'react';
import { Breadcrumb, Layout, Upload, Icon, Button, message, Tabs, Row, Col, Switch } from 'antd';
import queryString from 'query-string';
import { Stage, Layer, Rect, Image } from 'react-konva';
import config from '../../config';
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
      width: 0, //原图图的宽
      height: 0, //原图的高
      img: null, //新宽高的image对象
      defaultKey: false, //默认显示的页面，false表示是上传页面，true是相机流
      fetchUploading: false, //获取相机照片按钮的uploading表示标志
      fetchCamera: false, //获取相机最新照片的标志
    }
    this.handleUpload = this.handleUpload.bind(this);
    this.onChangePage = this.onChangePage.bind(this);
    this.handleFetch = this.handleFetch.bind(this);
  }
  getBase64(img, callback) { //回调函数形式获取图片base64格式
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  }
  handleUpload = () => { //点击上传按钮之后的操作
    this.setState({
      uploading: true, //使得上传按钮变成loading状态
    });
    const url = config.visionUrl + "/localization/code";
    const params = {};
    const body = {
      img: this.state.base64,
      category: 'qrcode',
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
        this.setState({ //将结果存储 并且各个状态值修改
          resultShow: true,
          result: res,
          uploading: false,
          showButton: true,
        });
        console.log(res.results);
      })
      .catch(err => {
        this.setState({ //将按钮变成可操作，表示重新上传
          uploading: false,
          showButton: true,
        });
        message.error('上传至后台发生错误~请重试');
        console.log(err);
      });
  };
  handleDistance(x1, y1, x2, y2) {
    return (Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)));
  }
  handleRotation(x1, y1, x2, y2) {
    return (Math.atan2(y2 - y1, x2 - x1) / Math.PI * 180);
  }
  onChangePage(checked) {
    this.setState({
      defaultKey: checked,
      base64: null,
      fetchCamera: false,
      showDragger: true,
      resultShow: false, //结果展示与否
    });
  }
  handleFetch = () => {
    this.setState({
      fetchUploading: true, //使得上传按钮变成loading状态
      resultShow: false, //结果展示与否
    });
    const url = config.cameraUrl + "/camera/latest_image?exposure_time=300";
    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        "Accept": '*/*',
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "*",
      },
      mode: 'cors',
    })
      .then((res) => {
        return res.json();
      })
      .then(res => {
        message.success('成功获取相机最新的图片~');
        var img = new window.Image();
        img.src = res.img;
        img.onload = () => {
          const width = img.width;
          const height = img.height;
          if (height < width) {
            img.width = 500;
            img.height = 500 * height / width;
          } else {
            img.width = 500 * width / height;
            img.height = 500;
          }
          this.setState({
            width: width,
            height: height,
            img: img,
            base64: res.img, //图片base64加密后格式，用于显示图片同时发给后台
            fetchCamera: true,
            fetchUploading: false,
            showButton: false, //按钮变灰无法点击
            resultShow: false, //将上一次的结果不显示
          });
        };
      })
      .catch(err => {
        this.setState({ //将按钮变成可操作，表示重新上传
          fetchUploading: false,
          fetchCamera: false,
        });
        message.error('获取相机最新的图片发生错误~请重试');
        console.log(err);
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
        new Promise((resolve, reject) => { //将file转化成base64
          var reader = new FileReader();
          reader.readAsDataURL(file);
          reader.addEventListener("load", function () {
            resolve(reader.result);
          }, false);
        })
          .then((res) => { //将base64之后的数据重新new一个image对象，修改宽、高用于结果中的canvas画图
            var img = new window.Image();
            img.src = res;
            img.onload = () => {
              const width = img.width;
              const height = img.height;
              if (height < width) {
                img.width = 500;
                img.height = 500 * height / width;
              } else {
                img.width = 500 * width / height;
                img.height = 500;
              }
              this.setState({
                width: width,
                height: height,
                img: img,
                base64: res, //图片base64加密后格式，用于显示图片同时发给后台
                showDragger: false, //上传框框中设置为展示用户上传的图片
                showButton: false, //按钮变灰无法点击
                resultShow: false, //将上一次的结果不显示
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
    );
    return (
      <Content style={{ margin: '10px 16px' }}>
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item>定位</Breadcrumb.Item>
          <Breadcrumb.Item>二维码识别</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
          <Row style={{ marginBottom: 16 }}>
            是否切换相机流：<Switch checkedChildren="是" unCheckedChildren="否" defaultChecked={false} onChange={this.onChangePage} />
            <br />
          </Row>
          <Row>
            <Col span={12}>
              {this.state.defaultKey ? (
                <React.Fragment>
                  <Row>
                    <Button
                      type="primary"
                      onClick={this.handleFetch}
                      loading={this.state.fetchUploading}
                      style={{ marginBottom: 16 }}
                    >
                      {this.state.fetchUploading ? '获取中' : '获取相机最新照片'}
                    </Button>
                  </Row>
                  <Row>
                    {this.state.fetchCamera ? (
                      <React.Fragment>
                        <Row>
                          <div style={{ width: "90%", height: this.state.img.height + 40, border: "1px dashed #d9d9d9", borderRadius: "4px" }}>
                            <center>
                              <img src={this.state.base64} alt="相机最新照片" style={{ width: this.state.img.width, marginTop: 20 }} />
                            </center>
                          </div>
                        </Row>
                        <Row>
                          <Button
                            type="primary"
                            onClick={this.handleUpload}
                            disabled={this.state.showButton}
                            loading={this.state.uploading}
                            style={{ marginTop: 16 }}
                          >
                            {this.state.uploading ? '上传中' : '开始上传'}
                          </Button>
                        </Row>
                      </React.Fragment>
                    ) : null}
                  </Row>
                </React.Fragment>
              ) : (
                  <React.Fragment>
                    <Upload {...props}>
                      {this.state.showDragger
                        ? uploadButton
                        : <img src={this.state.base64} alt="照片" style={{ width: this.state.img.width, }} />}
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
                  </React.Fragment>
                )}
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
                        <Stage
                          width={this.state.img.width}
                          height={this.state.img.height}
                        >
                          <Layer>
                            <Image image={this.state.img} style={{ width: "100%" }} />
                            <Rect
                              ref='rect'
                              x={(this.state.result.results[1][0][0][0] / this.state.width) * this.state.img.width}
                              y={(this.state.result.results[1][0][0][1] / this.state.height) * this.state.img.height}
                              width={this.handleDistance(this.state.result.results[1][0][0][0] / this.state.width * this.state.img.width, this.state.result.results[1][0][0][1] / this.state.height * this.state.img.height
                                , this.state.result.results[1][1][0][0] / this.state.width * this.state.img.width, this.state.result.results[1][1][0][1] / this.state.height * this.state.img.height)}
                              height={this.handleDistance(this.state.result.results[1][0][0][0] / this.state.width * this.state.img.width, this.state.result.results[1][0][0][1] / this.state.height * this.state.img.height
                                , this.state.result.results[1][3][0][0] / this.state.width * this.state.img.width, this.state.result.results[1][3][0][1] / this.state.height * this.state.img.height)}
                              rotation={this.handleRotation(this.state.result.results[1][0][0][0], this.state.result.results[1][0][0][1]
                                , this.state.result.results[1][1][0][0], this.state.result.results[1][1][0][1])}
                              shadowBlur={10}
                              stroke="red"
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
