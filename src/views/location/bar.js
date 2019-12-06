import React from 'react';
import { Breadcrumb, Layout, Upload, Icon, Button, message, Tabs, Row, Col, Switch, Select, Card } from 'antd';
import queryString from 'query-string';
import { Stage, Layer, Line, Image } from 'react-konva';
const { Content } = Layout;
const { TabPane } = Tabs;
const { Option } = Select;

class Bar extends React.Component {
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
      selectDefaultValue: null, //select选择框中显示的值
      selectDefaultIndex: 0, //select选择框中显示的第几组结果
      width: 0, //原图图的宽
      height: 0, //原图的高
      img: null, //新宽高的image对象
    }
    this.handleUpload = this.handleUpload.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onChangeSelect = this.onChangeSelect.bind(this);
    this.onChangeSelectIndex = this.onChangeSelectIndex.bind(this);
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
    const params = {
      filter_qrcode: this.state.defaultKey,
    };
    const body = {
      img: this.state.base64,
      category: 'barcode',
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
          resultShow: true,
          result: res,
          selectDefaultValue: Object.keys(res.results).length === 0 ? null : Object.keys(res.results)[0],
          uploading: false,
          showButton: true,
        });

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
  onChangeSelect(value) {
    this.setState({
      selectDefaultValue: value,
      selectDefaultIndex: 0,
    });
  }
  onChangeSelectIndex(value) {
    this.setState({
      selectDefaultIndex: value,
    });
  }
  handlePoints(array, devided) {
    const arr = array.flat();
    const arrNew = arr.map((k) => {
      return (k / devided);
    });
    return arrNew;
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
              showButton: false, //按钮变灰无法点击
              resultShow: false, //将上一次的结果不显示
              selectDefaultValue: null, //select选择框中显示的值
              selectDefaultIndex: 0, //select选择框中显示的第几组结果
              result: null, //存储返回结果
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
    );
    return (
      <Content style={{ margin: '10px 16px' }}>
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item>定位</Breadcrumb.Item>
          <Breadcrumb.Item>条形码识别</Breadcrumb.Item>
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
                  {Object.keys(this.state.result.results).length === 0 ? (this.state.defaultKey ? '上传的图片不含有条形码,尝试将筛选二维码按钮设置为否进行识别二维码' : '上传的图片不含有条形码或者二维码') : (
                    <React.Fragment>
                      结果类型：<Select style={{ width: 150 }} defaultValue={Object.keys(this.state.result.results)[0]} onChange={this.onChangeSelect}>
                        {Object.keys(this.state.result.results).map((k, i) => {
                          return (<Option value={k} key={i}>{k}</Option>);
                        })}
                      </Select>
                      <br />
                      <React.Fragment>
                        选择查看的结果序号：<Select style={{ width: 80 }} defaultValue={this.state.selectDefaultIndex} onChange={this.onChangeSelectIndex}>
                          {this.state.result.results[this.state.selectDefaultValue].map((k, i) => {
                            return (<Option value={i} key={k + i}>{i + 1}</Option>)
                          })}
                        </Select>
                      </React.Fragment>
                      <Card title={"第" + (this.state.selectDefaultIndex + 1) + "组结果"} key={this.state.selectDefaultValue + this.state.selectDefaultIndex}>
                        <Tabs defaultActiveKey="1">
                          <TabPane tab="识别内容" key={this.state.selectDefaultValue + this.state.selectDefaultIndex + "1"}>
                            {this.state.result.results[this.state.selectDefaultValue][this.state.selectDefaultIndex][0]}
                          </TabPane>
                          <TabPane tab="条形码定位" key={this.state.selectDefaultValue + this.state.selectDefaultIndex + "2"}>
                            <Stage
                              width={this.state.img.width}
                              height={this.state.img.height}
                            >
                              <Layer>
                                <Image image={this.state.img} style={{ width: "100%" }} />
                                <Line
                                  points={this.handlePoints(this.state.result.results[this.state.selectDefaultValue][this.state.selectDefaultIndex][1], this.state.width / this.state.img.width)}
                                  shadowBlur={10}
                                  stroke="red"
                                  closed={true}
                                >
                                </Line>
                              </Layer>
                            </Stage>
                          </TabPane>
                        </Tabs>
                      </Card>
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

export default Bar;
