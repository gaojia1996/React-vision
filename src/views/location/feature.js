import React from 'react';
import { Breadcrumb, Layout, Upload, Icon, Button, message, Tabs, Row, Col, Switch, Select, InputNumber, Tooltip, } from 'antd';
import queryString from 'query-string';
import { Stage, Layer, Rect, Image } from 'react-konva';
import config from '../../config';
const { Content } = Layout;
const { TabPane } = Tabs;
const { Option } = Select;

class Code extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showDragger: true, //上传照片在框框中的显示表示
      base64: null, //存放base64加密的图片数据
      showButton: true, //按钮变灰与否
      width: 0, //原图图的宽
      height: 0, //原图的高
      img: null, //新宽高的image对象
      showDraggerFeature: true,
      base64Feature: null,
      showButtonFeature: true,
      widthFeature: 0,
      heightFeature: 0,
      imgFeature: null,
      uploading: false, //按钮 上传中/开始上传 的表示符
      resultShow: false, //结果展示与否
      result: null, //存储返回结果
      defaultKey: false, //默认显示的页面，false表示是上传页面，true是相机流
      defaultMatchKey: "gray_value", //默认匹配方式
      defaultMethodKey: "CCORR_NORMED", //默认的求相似度的方法
      param1: 50,  //默认Canny算法低阈值
      param2: 200,  //默认Canny算法高阈值
      min: 0.8,  //默认缩放低阈值
      max: 1.2,  //默认缩放高阈值
      bin: 20, //默认切片数量
      fetchUploading: false, //获取相机照片按钮的uploading表示标志
      fetchCamera: false, //获取相机最新照片的标志
    }
    this.handleUpload = this.handleUpload.bind(this);
    this.onChangePage = this.onChangePage.bind(this);
    this.handleFetch = this.handleFetch.bind(this);
    this.onChangeSelectMatch = this.onChangeSelectMatch.bind(this);
    this.onChangeSelectMethod = this.onChangeSelectMethod.bind(this);
    this.onChangeParam1 = this.onChangeParam1.bind(this);
    this.onChangeParam2 = this.onChangeParam2.bind(this);
    this.onChangeMin = this.onChangeMin.bind(this);
    this.onChangeMax = this.onChangeMax.bind(this);
    this.onChangeBin = this.onChangeBin.bind(this);
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
    const url = config.visionUrl + "/localization/match";
    const paramsGray = {
      method: this.state.defaultMethodKey,
    }
    const paramsEdge = {
      method: this.state.defaultMethodKey,
      canny_threshold: [this.state.param1, this.state.param2],
      scale: [this.state.min, this.state.max, this.state.bin],
    }
    const params = this.state.defaultMatchKey === "gray_value" ? paramsGray : paramsEdge;
    const body = {
      target: this.state.base64,
      template: this.state.base64Feature,
      matching_based: this.state.defaultMatchKey,
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
          showButtonFeature: true,
        });
        console.log(res.results);
      })
      .catch(err => {
        this.setState({ //将按钮变成可操作，表示重新上传
          uploading: false,
          showButton: true,
          showButtonFeature: true,
        });
        message.error('上传至后台发生错误~请重试');
        console.log(err);
      });
  };
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
      fetchCamera: false,
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
            img.width = 300;
            img.height = 300 * height / width;
          } else {
            img.width = 300 * width / height;
            img.height = 300;
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
  onChangeSelectMatch(value) {
    this.setState({
      defaultMatchKey: value,
      showButton: false,
      showButtonFeature: false,
      resultShow: false,
    });
  }
  onChangeSelectMethod(value) {
    this.setState({
      defaultMethodKey: value,
      showButton: false,
      showButtonFeature: false,
      resultShow: false,
    });
  }
  onChangeParam1(value) {
    this.setState({
      param1: value,
      showButton: false,
      showButtonFeature: false,
      resultShow: false,
    });
  }
  onChangeParam2(value) {
    this.setState({
      param2: value,
      showButton: false,
      showButtonFeature: false,
      resultShow: false,
    });
  }
  onChangeMin(value) {
    this.setState({
      min: value,
      showButton: false,
      showButtonFeature: false,
      resultShow: false,
    });
  }
  onChangeMax(value) {
    this.setState({
      max: value,
      showButton: false,
      showButtonFeature: false,
      resultShow: false,
    });
  }
  onChangeBin(value) {
    this.setState({
      bin: value,
      showButton: false,
      showButtonFeature: false,
      resultShow: false,
    });
  }
  render() {
    const propsFeature = {
      action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
      listType: "picture-card",
      name: "avatarFeature",
      className: "avatar-uploader-feature",
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
                img.width = 300;
                img.height = 300 * height / width;
              } else {
                img.width = 300 * width / height;
                img.height = 300;
              }
              this.setState({
                widthFeature: width,
                heightFeature: height,
                imgFeature: img,
                base64Feature: res, //图片base64加密后格式，用于显示图片同时发给后台
                showDraggerFeature: false, //上传框框中设置为展示用户上传的图片
                showButtonFeature: false, //按钮变灰无法点击
                resultShow: false, //将上一次的结果不显示
              });
            };
            return false;
          });
      },
    };
    const props = {
      action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
      listType: "picture-card",
      name: "avatar",
      className: "avatar-uploader-feature",
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
                img.width = 300;
                img.height = 300 * height / width;
              } else {
                img.width = 300 * width / height;
                img.height = 300;
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
          <Breadcrumb.Item>模板匹配</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
          <Row>
            <Col span={16}>
              <Row>
                <Col span={12}>
                  <Row style={{ marginBottom: 16 }}>
                    上传匹配的模板图片
                    <br />
                  </Row>
                  <Upload {...propsFeature}>
                    {this.state.showDraggerFeature
                      ? uploadButton
                      : <img src={this.state.base64Feature} alt="照片" style={{ width: this.state.imgFeature.width, }} />}
                  </Upload>
                </Col>
                <Col span={12}>
                  <Row style={{ marginBottom: 16 }}>
                    是否切换相机流：<Switch checkedChildren="是" unCheckedChildren="否" defaultChecked={false} onChange={this.onChangePage} />
                    <br />
                  </Row>
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
                      </React.Fragment>
                    )}
                </Col>
              </Row>
              <Row>
                选择匹配方式：<Select style={{ width: 120 }} defaultValue={this.state.defaultMatchKey} onChange={this.onChangeSelectMatch}>
                  <Option value={"gray_value"} key={"gray_value"}>灰度值匹配</Option>
                  <Option value={"edge"} key={"edge"}>边缘匹配</Option>
                </Select> <br />
                {this.state.defaultMatchKey === "gray_value" ? (
                  <React.Fragment>
                    <Tooltip placement="right" title={"选择求相似度的方法"}>
                      求相似度的方法：<Select style={{ width: 120 }} defaultValue={this.state.defaultMethodKey} onChange={this.onChangeSelectMethod}>
                        <Option value={"CCOEFF"} key={"CCOEFF"}>CCOEFF</Option>
                        <Option value={"CCOEFF_NORMED"} key={"CCOEFF_NORMED"}>CCOEFF_NORMED</Option>
                        <Option value={"CCORR"} key={"CCORR"}>CCORR</Option>
                        <Option value={"CCORR_NORMED"} key={"CCORR_NORMED"}>CCORR_NORMED</Option>
                        <Option value={"SQDIFF"} key={"SQDIFF"}>SQDIFF</Option>
                        <Option value={"SQDIFF_NORMED"} key={"SQDIFF_NORMED"}>SQDIFF_NORMED</Option>
                      </Select>
                    </Tooltip>  <br />
                  </React.Fragment>
                ) : (
                    <React.Fragment>
                      <Tooltip placement="right" title={"选择求相似度的方法"}>
                        求相似度的方法：<Select style={{ width: 120 }} defaultValue={this.state.defaultMethodKey} onChange={this.onChangeSelectMethod}>
                          <Option value={"CCOEFF"} key={"CCOEFF"}>CCOEFF</Option>
                          <Option value={"CCOEFF_NORMED"} key={"CCOEFF_NORMED"}>CCOEFF_NORMED</Option>
                          <Option value={"CCORR"} key={"CCORR"}>CCORR</Option>
                          <Option value={"CCORR_NORMED"} key={"CCORR_NORMED"}>CCORR_NORMED</Option>
                          <Option value={"SQDIFF"} key={"SQDIFF"}>SQDIFF</Option>
                          <Option value={"SQDIFF_NORMED"} key={"SQDIFF_NORMED"}>SQDIFF_NORMED</Option>
                        </Select>
                      </Tooltip>  <br />
                      <Tooltip placement="right" title={"低阈值用于将高阈值检测出来间断的边缘连接起来"}>
                        Canny边缘检测低阈值: <InputNumber key='param1' min={1} max={1000} defaultValue={this.state.param1} onChange={this.onChangeParam1} />
                      </Tooltip>  <br />
                      <Tooltip placement="right" title={"阈值越大检测圆边界时，要求的亮度梯度越大，一些灰灰的不明显的边界就会略去"}>
                        Canny边缘检测高阈值: <InputNumber key='param2' min={1} max={1000} defaultValue={this.state.param2} onChange={this.onChangeParam2} />
                      </Tooltip>  <br />
                      <Tooltip placement="right" title={"使用该范围对template进行缩放对目标图片进行匹配"}>
                        缩放范围:
                        <InputNumber key='min' min={0.1} max={1} defaultValue={this.state.min} onChange={this.onChangeMin} /> -
                        <InputNumber key='max' min={1} defaultValue={this.state.max} onChange={this.onChangeMax} />
                      </Tooltip>  <br />
                      <Tooltip placement="right" title={"在缩放范围内进行切片个数划分"}>
                        缩放的切片个数: <InputNumber key='bin' min={1} defaultValue={this.state.bin} onChange={this.onChangeBin} />
                      </Tooltip>  <br />
                    </React.Fragment>
                  )}
                <Button
                  type="primary"
                  onClick={this.handleUpload}
                  disabled={this.state.result !== null ? (this.state.showButton && this.state.showButtonFeature) : (this.state.showButton || this.state.showButtonFeature)}
                  loading={this.state.uploading}
                  style={{ marginTop: 16 }}
                >
                  {this.state.uploading ? '上传中' : '开始上传'}
                </Button>
              </Row>
            </Col>
            <Col span={8}>
              {this.state.resultShow ? (
                <React.Fragment>
                  <h3>识别结果</h3>
                  <hr />
                  {this.state.result.results === null ? '上传的图片无法进行匹配' :
                    <Tabs defaultActiveKey="1">
                      <TabPane tab="匹配结果" key="1">
                        <Stage
                          width={this.state.img.width}
                          height={this.state.img.height}
                        >
                          <Layer>
                            <Image image={this.state.img} style={{ width: "100%" }} />
                            <Rect
                              ref='rect'
                              x={(this.state.result.results[0][0][0] / this.state.width) * this.state.img.width}
                              y={(this.state.result.results[0][0][1] / this.state.height) * this.state.img.height}
                              width={(this.state.result.results[0][2] / this.state.width) * this.state.img.width}
                              height={(this.state.result.results[0][1] / this.state.width) * this.state.img.width}
                              shadowBlur={10}
                              stroke="red"
                              strokeWidth={4}
                            />
                          </Layer>
                        </Stage>
                      </TabPane>
                      <TabPane tab="匹配分数" key="2">
                        {this.state.result.results[1]}
                      </TabPane>
                      {this.state.defaultMatchKey === "edge" ? (
                        <TabPane tab="缩放比例" key="3">
                          {(1 / this.state.result.results[2])}
                        </TabPane>
                      ) : null}
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
