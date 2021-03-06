import React from 'react';
import { Breadcrumb, Layout, Upload, Icon, Button, message, Row, Col, Select, InputNumber, Card, Tooltip, Tabs, Switch } from 'antd';
import queryString from 'query-string';
import { Stage, Layer, Line, Circle, Image, Text } from 'react-konva';
import config from '../../config';
const { TabPane } = Tabs;
const { Content } = Layout;
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
      param2: 50,
      min_radius: 0,
      max_radius: 0,
      thresh: 127,
      epsilon_rate: 0.02,
      width: 0, //原图图的宽
      height: 0, //原图的高
      img: null, //新宽高的image对象
      selectDefaultIndex: 0,
      text: "",
      defaultKeyPage: false, //默认显示相机流与否
      fetchCamera: false, //获取相机最新照片的标志
      fetchUploading: false, //获取相机照片按钮的uploading表示标志
      is_debugging: true, //默认显示debug信息
      debugKey: null, //select选择的debug内容
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
    this.onChangeSelectIndex = this.onChangeSelectIndex.bind(this);
    this.onChangePage = this.onChangePage.bind(this);
    this.handleFetch = this.handleFetch.bind(this);
    this.onChangeDebugKey = this.onChangeDebugKey.bind(this);
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
      is_debugging: this.state.is_debugging,
    }
    const params = this.state.defaultKey === "circle" ? paramsCircle : paramPolygon;
    const url = config.visionUrl + "/localization/shape";
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
        console.log(res.results);
        message.success('图片已成功上传至后台~');
        this.setState({
          selectDefaultIndex: 0,
          result: res,
          uploading: false,
          showButton: true,
          resultShow: true,
          debugKey: this.state.defaultKey === "circle" ? null : Object.keys(res.debug)[0],
        });
      })
      .catch(err => {
        this.setState({
          uploading: false,
          resultShow: false,
        });
        message.error('上传至后台发生错误~请重试');
        console.log(err);
      });
  };
  onChangeSelect(value) {
    this.setState({
      defaultKey: value,
      showButton: false,
      resultShow: false,
    });
  }
  onChangeMinDist(value) {
    this.setState({
      min_dist: value,
      showButton: false,
      resultShow: false,
    });
  }
  onChangeParam1(value) {
    this.setState({
      param1: value,
      showButton: false,
      resultShow: false,
    });
  }
  onChangeParam2(value) {
    this.setState({
      param2: value,
      showButton: false,
      resultShow: false,
    });
  }
  onChangeMinRadius(value) {
    this.setState({
      min_radius: value,
      showButton: false,
      resultShow: false,
    });
  }
  onChangeMaxRadius(value) {
    this.setState({
      max_radius: value,
      showButton: false,
      resultShow: false,
    });
  }
  onChangeThresh(value) {
    this.setState({
      thresh: value,
      showButton: false,
      resultShow: false,
    });
  }
  onChangeEpsionRate(value) {
    this.setState({
      epsilon_rate: value,
      showButton: false,
      resultShow: false,
    });
  }
  onChangeSelectIndex(value) {
    this.setState({
      selectDefaultIndex: value,
    });
  }
  handleName(key) {
    switch (key) {
      case "circle":
        return "圆形";
      case "triangle":
        return "三角形";
      case "rectangle":
        return "矩形";
      case "square":
        return "正方形";
      case "diamond":
        return "菱形";
      case "pentagon":
        return "五边形";
      case "hexagon":
        return "六边形";
      default:
        return "无法识别";
    }
  }
  handlePoints(array, devided) {
    const arr = array.flat();
    const arrNew = arr.map((k) => {
      return (k / devided);
    });
    return arrNew;
  }
  renderAllCircle(result, devided) {
    const resultCircle = result.map((k, i) => {
      return (
        <Circle
          x={k[0] * devided}
          y={k[1] * devided}
          radius={k[2] * devided}
          stroke="red"
          strokeWidth={4}
          key={'circle' + i}
          onMouseOver={() => {
            this.setState({
              text: "圆形结果" + (i + 1),
            })
          }}
          onMouseOut={() => {
            this.setState({
              text: "",
            })
          }}
        >
        </Circle>
      )
    });
    return resultCircle;
  }
  renderAllPolygon(result, devided) {
    const resultPolygon = result.map((k, i) => {
      return (
        <Line
          points={this.handlePoints(k, devided)}
          closed={true}
          stroke="red"
          strokeWidth={4}
          key={'polygon' + i}
          onMouseOver={() => {
            this.setState({
              text: this.handleName(this.state.defaultKey) + "结果" + (i + 1),
            })
          }}
          onMouseOut={() => {
            this.setState({
              text: "",
            })
          }}
        >
        </Line>
      )
    });
    return resultPolygon;
  }
  handleBLC(devided) {
    let array = [0, 20, 0, 25, 50, 25, 50, 20];
    array[4] = 50 * devided;
    array[6] = 50 * devided;
    return array;
  }
  onChangePage(checked) {
    this.setState({
      defaultKeyPage: checked,
      base64: null,
      fetchCamera: false,
      showDragger: true,
      resultShow: false, //结果展示与否
      defaultKey: "circle", //默认选择的筛选形状
      min_dist: 20,
      param1: 100,
      param2: 50,
      min_radius: 0,
      max_radius: 0,
      thresh: 127,
      epsilon_rate: 0.02,
    });
  }
  handleFetch = () => {
    this.setState({
      fetchUploading: true, //使得上传按钮变成loading状态
      resultShow: false, //结果展示与否
      base64: null,
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
  onChangeDebugKey(value) {
    this.setState({
      debugKey: value,
    })
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
          .then((res) => { //将base64之后的数据重新new一个image对象，修改宽、高用于结果中的canvas画图
            let img = new window.Image();
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
                base64: res, //图片base64加密后格式，用于显示图片同时发给后台
                width: width,
                height: height,
                img: img,
                selectDefaultIndex: 0, //select选择框中显示的第几组结果
                showButton: false, //按钮变灰无法点击
                resultShow: false, //将上一次的结果不显示
                result: null, //存储返回结果
                showDragger: false, //上传框框中设置为展示用户上传的图片
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
          <Breadcrumb.Item>形状探测器</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
          <Row style={{ marginBottom: 16 }}>
            是否切换相机流：<Switch checkedChildren="是" unCheckedChildren="否" defaultChecked={false} onChange={this.onChangePage} />
            <br />
          </Row>
          <Row>
            <Col span={12}>
              {this.state.defaultKeyPage ? (
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
                  {this.state.fetchCamera ? (
                    <React.Fragment>
                      <Row>
                        <div style={{ width: "90%", height: this.state.img.height + 40, border: "1px dashed #d9d9d9", borderRadius: "4px" }}>
                          <center>
                            <img src={this.state.base64} alt="相机最新照片" style={{ width: this.state.img.width, marginTop: 20 }} />
                          </center>
                        </div>
                      </Row>
                      <Stage width={300} height={50}>
                        <Layer>
                          <Line
                            points={this.handleBLC(this.state.img.width / this.state.width)}
                            closed={false}
                            stroke="black"
                          />
                          <Text text="50" />
                        </Layer>
                      </Stage>
                      <React.Fragment>
                        选择筛选的形状：<Select style={{ width: 120 }} defaultValue={this.state.defaultKey} onChange={this.onChangeSelect}>
                          <Option value={"circle"} key={"圆形"}>圆形</Option>
                          <Option value={"triangle"} key={"三角形"}>三角形</Option>
                          <Option value={"rectangle"} key={"矩形"}>矩形</Option>
                          <Option value={"square"} key={"正方形"}>正方形</Option>
                          <Option value={"diamond"} key={"菱形"}>菱形</Option>
                          <Option value={"pentagon"} key={"五边形"}>五边形</Option>
                          <Option value={"hexagon"} key={"六边形"}>六边形</Option>
                        </Select>
                        <br />
                        {this.state.defaultKey === "circle" ? (
                          <React.Fragment>
                            <Tooltip placement="right" title={"最小圆心距"}>
                              最小圆心距：<InputNumber key='min_dist' min={1} defaultValue={this.state.min_dist} onChange={this.onChangeMinDist} />
                            </Tooltip>  <br />
                            <Tooltip placement="right" title={"阈值越大检测圆边界时，要求的亮度梯度越大，一些灰灰的不明显的边界就会略去"}>
                              Canny边缘检测高阈值: <InputNumber key='param1' min={1} max={100} defaultValue={this.state.param1} onChange={this.onChangeParam1} />
                            </Tooltip>  <br />
                            <Tooltip placement="right" title={"阈值越小，越多假的圆会被检测到"}>
                              圆心检测阈值:<InputNumber key='param2' min={1} max={500} defaultValue={this.state.param2} onChange={this.onChangeParam2} />
                            </Tooltip>  <br />
                            <Tooltip placement="right" title={"允许检测到的圆的最小半径"}>
                              最小半径:<InputNumber key='min_radius' defaultValue={this.state.min_radius} min={0} onChange={this.onChangeMinRadius} />
                            </Tooltip>   <br />
                            <Tooltip placement="right" title={"允许检测到的圆的最大半径"}>
                              最大半径: <InputNumber key='max_radius' defaultValue={this.state.max_radius} min={0} onChange={this.onChangeMaxRadius} />
                            </Tooltip>  <br />
                          </React.Fragment>
                        ) : (
                            <React.Fragment>
                              <Tooltip placement="right" title={"利用设定的阈值判断图像像素为0还是255"}>
                                二值化阈值：<InputNumber key='thresh' min={0} max={255} step={1} defaultValue={this.state.thresh} onChange={this.onChangeThresh} />
                              </Tooltip> <br />
                              <Tooltip placement="right" title={"轮廓近似算法相关参数，一般在0.01~0.05之间"}>
                                轮廓近似算法相关参数: <InputNumber key='epsilon_rate' defaultValue={this.state.epsilon_rate} min={0.01} max={0.05} step={0.001} onChange={this.onChangeEpsionRate} />
                              </Tooltip> <br />
                            </React.Fragment>
                          )}
                      </React.Fragment>
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
                  ) : null}
                </React.Fragment>
              ) : (
                  <React.Fragment>
                    <Upload {...props}>
                      {this.state.showDragger
                        ? uploadButton
                        : <img src={this.state.base64} alt="照片" style={{ width: this.state.img.width, }} />}
                    </Upload>
                    {this.state.showDragger ? null : (
                      <Stage width={300} height={50}>
                        <Layer>
                          <Line
                            points={this.handleBLC(this.state.img.width / this.state.width)}
                            closed={false}
                            stroke="black"
                          />
                          <Text text="50" />
                        </Layer>
                      </Stage>
                    )}
                    <Row>
                      {this.state.showDragger ? null : (
                        <React.Fragment>
                          选择筛选的形状：<Select style={{ width: 120 }} defaultValue={this.state.defaultKey} onChange={this.onChangeSelect}>
                            <Option value={"circle"} key={"圆形"}>圆形</Option>
                            <Option value={"triangle"} key={"三角形"}>三角形</Option>
                            <Option value={"rectangle"} key={"矩形"}>矩形</Option>
                            <Option value={"square"} key={"正方形"}>正方形</Option>
                            <Option value={"diamond"} key={"菱形"}>菱形</Option>
                            <Option value={"pentagon"} key={"五边形"}>五边形</Option>
                            <Option value={"hexagon"} key={"六边形"}>六边形</Option>
                          </Select>
                          <br />
                          {this.state.defaultKey === "circle" ? (
                            <React.Fragment>
                              <Tooltip placement="right" title={"最小圆心距"}>
                                最小圆心距：<InputNumber key='min_dist' min={1} defaultValue={this.state.min_dist} onChange={this.onChangeMinDist} />
                              </Tooltip>  <br />
                              <Tooltip placement="right" title={"阈值越大检测圆边界时，要求的亮度梯度越大，一些灰灰的不明显的边界就会略去"}>
                                Canny边缘检测高阈值: <InputNumber key='param1' min={1} max={100} defaultValue={this.state.param1} onChange={this.onChangeParam1} />
                              </Tooltip>  <br />
                              <Tooltip placement="right" title={"阈值越小，越多假的圆会被检测到"}>
                                圆心检测阈值:<InputNumber key='param2' min={1} max={500} defaultValue={this.state.param2} onChange={this.onChangeParam2} />
                              </Tooltip>  <br />
                              <Tooltip placement="right" title={"允许检测到的圆的最小半径"}>
                                最小半径:<InputNumber key='min_radius' defaultValue={this.state.min_radius} min={0} onChange={this.onChangeMinRadius} />
                              </Tooltip>   <br />
                              <Tooltip placement="right" title={"允许检测到的圆的最大半径"}>
                                最大半径: <InputNumber key='max_radius' defaultValue={this.state.max_radius} min={0} onChange={this.onChangeMaxRadius} />
                              </Tooltip>  <br />
                            </React.Fragment>
                          ) : (
                              <React.Fragment>
                                <Tooltip placement="right" title={"利用设定的阈值判断图像像素为0还是255"}>
                                  二值化阈值：<InputNumber key='thresh' min={0} max={255} step={1} defaultValue={this.state.thresh} onChange={this.onChangeThresh} />
                                </Tooltip> <br />
                                <Tooltip placement="right" title={"轮廓近似算法相关参数，一般在0.01~0.05之间"}>
                                  轮廓近似算法相关参数: <InputNumber key='epsilon_rate' defaultValue={this.state.epsilon_rate} min={0.01} max={0.05} step={0.001} onChange={this.onChangeEpsionRate} />
                                </Tooltip> <br />
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
                  </React.Fragment>
                )}
            </Col>
            <Col span={12}>
              {this.state.resultShow ? (
                <React.Fragment>
                  <h3>识别结果</h3>
                  <hr />
                  {this.state.defaultKey === "circle" ? (
                    <React.Fragment>
                      {this.state.result.results === null || this.state.result['results'].length === 0 ? (
                        '上传的图片不含有符合条件的圆形，请修改查找圆形的条件或者选择筛选其他形状~'
                      ) : (
                          <React.Fragment>
                            结果类型：<Select style={{ width: 150 }} defaultValue={"circle"}>
                              <Option value={"circle"} key={"圆形"}>圆形</Option>
                            </Select>
                            <br />
                            <Tabs defaultActiveKey="1">
                              <TabPane tab="所有识别内容" key="1">
                                <Card title={"所有识别结果"} key={"Allcircle"}>
                                  <Stage
                                    width={this.state.img.width}
                                    height={this.state.img.height + 50}
                                  >
                                    <Layer>
                                      <Image image={this.state.img} style={{ width: "100%" }} />
                                      <Text x={10} y={this.state.img.height + 5} text={this.state.text} fontSize={24} fill={"black"} />
                                      {this.renderAllCircle(this.state.result.results, this.state.img.width / this.state.width)}
                                    </Layer>
                                  </Stage>
                                </Card>
                              </TabPane>
                              <TabPane tab="具体识别内容" key="2">
                                选择查看的结果序号：<Select style={{ width: 80 }} defaultValue={this.state.selectDefaultIndex} onChange={this.onChangeSelectIndex}>
                                  {this.state.result.results.map((k, i) => {
                                    return (<Option value={i} key={k + i}>{i + 1}</Option>)
                                  })}
                                </Select>
                                <Card title={"第" + (this.state.selectDefaultIndex + 1) + "组结果"} key={"circle" + this.state.selectDefaultIndex}>
                                  <Stage
                                    width={this.state.img.width}
                                    height={this.state.img.height}
                                  >
                                    <Layer>
                                      <Image image={this.state.img} style={{ width: "100%" }} />
                                      <Circle
                                        x={this.state.result.results[this.state.selectDefaultIndex][0] * this.state.img.width / this.state.width}
                                        y={this.state.result.results[this.state.selectDefaultIndex][1] * this.state.img.width / this.state.width}
                                        radius={this.state.result.results[this.state.selectDefaultIndex][2] * this.state.img.width / this.state.width}
                                        stroke="red"
                                        strokeWidth={4}
                                      >
                                      </Circle>
                                    </Layer>
                                  </Stage>
                                </Card>
                              </TabPane>
                            </Tabs>
                          </React.Fragment>
                        )}
                    </React.Fragment>
                  ) : (
                      <React.Fragment>{Object.keys(this.state.result.results).length === 0}
                        {Object.keys(this.state.result.results).length === 0 ? (
                          '上传的图片不含有符合条件的' + this.handleName(this.state.defaultKey) + '，请修改查找' + this.handleName(this.state.defaultKey) + '的条件或者选择筛选其他形状~'
                        ) : (
                            <React.Fragment>
                              结果类型：<Select style={{ width: 150 }} defaultValue={this.state.defaultKey}>
                                <Option value={this.state.defaultKey} key={this.handleName(this.state.defaultKey)}>{this.handleName(this.state.defaultKey)}</Option>
                              </Select>
                              <br />
                              <Tabs defaultActiveKey="1">
                                <TabPane tab="所有识别内容" key="1">
                                  <Card title={"所有识别结果"} key={"AllPolygon"}>
                                    <Stage
                                      width={this.state.img.width}
                                      height={this.state.img.height + 50}
                                    >
                                      <Layer>
                                        <Image image={this.state.img} style={{ width: "100%" }} />
                                        <Text x={10} y={this.state.img.height + 5} text={this.state.text} fontSize={24} fill={"black"} />
                                        {this.renderAllPolygon(this.state.result.results[this.state.defaultKey], this.state.width / this.state.img.width)}
                                      </Layer>
                                    </Stage>
                                  </Card>
                                </TabPane>
                                <TabPane tab="具体识别内容" key="2">
                                  选择查看的结果序号：<Select style={{ width: 80 }} defaultValue={this.state.selectDefaultIndex} onChange={this.onChangeSelectIndex}>
                                    {this.state.result.results[this.state.defaultKey].map((k, i) => {
                                      return (<Option value={i} key={k + i}>{i + 1}</Option>)
                                    })}
                                  </Select>
                                  <Card title={"第" + (this.state.selectDefaultIndex + 1) + "组结果"} key={"circle" + this.state.selectDefaultIndex}>
                                    <Stage
                                      width={this.state.img.width}
                                      height={this.state.img.height}
                                    >
                                      <Layer>
                                        <Image image={this.state.img} style={{ width: "100%" }} />
                                        <Line
                                          points={this.handlePoints(this.state.result.results[this.state.defaultKey][this.state.selectDefaultIndex], this.state.width / this.state.img.width)}
                                          closed={true}
                                          stroke="red"
                                          strokeWidth={4}
                                        >
                                        </Line>
                                      </Layer>
                                    </Stage>
                                  </Card>
                                </TabPane>
                                {this.state.is_debugging ? (
                                  <TabPane tab="debug内容" key="3">
                                    选择查看的debug：<Select style={{ width: 150 }} defaultValue={this.state.debugKey} onChange={this.onChangeDebugKey}>
                                      {Object.keys(this.state.result.debug).map((k, i) => {
                                        return (
                                          <Option value={k} key={k + i}>{k}</Option>
                                        );
                                      })}
                                    </Select>
                                    <Card title={this.state.debugKey + "结果"} key={"polygonDebug" + this.state.debugKey}>
                                      <center>
                                        <img src={this.state.result.debug[this.state.debugKey]} alt={this.state.debugKey + "照片" } width={this.state.img.width}></img>
                                      </center>
                                    </Card>
                                  </TabPane>
                                ) : null}
                              </Tabs>
                            </React.Fragment>
                          )}
                      </React.Fragment>
                    )}
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
