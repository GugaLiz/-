import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Layout,Tooltip,Icon,Button,Table,Radio,Form,Input,Row,Col,Checkbox,InputNumber,Card } from 'antd';
import numeral from 'numeral';
import { ChartCard, Field } from 'components/Charts';
import Trend from 'components/Trend';

//import styles from './DetailPnl.less';
import { Meta } from 'antd/lib/list/Item';

import MyIcon from 'components/MyIcon';
import online from '../../../../assets/images/monitor/online.ico';
import offline from '../../../../assets/images/monitor/offline.ico';

import light from '../../../../assets/images/device/light.ico';
import liteprobe from '../../../../assets/images/device/liteprobe.ico';
import pioneer from '../../../../assets/images/device/pioneer.ico';
import RCU from '../../../../assets/images/device/RCU.ico';
import scout from '../../../../assets/images/device/scout.ico';
import walktour from '../../../../assets/images/device/walktour.ico';
import walktourpack from '../../../../assets/images/device/walktourpack.ico';
import ATU from '../../../../assets/images/device/ATU.png';
import VIP from '../../../../assets/images/device/VIP.png';
import indoor_ATU from '../../../../assets/images/device/indoor.png';
import scout2 from '../../../../assets/images/device/scount2.png';
import BCU from '../../../../assets/images/device/BCU.png';
import CTU from '../../../../assets/images/device/CTU.png';

const { Sider,Content } = Layout;
const FormItem = Form.Item;

@connect(({ loading }) => ({
    //submitting: loading.effects['form/submitRegularForm'],
  }))
  @Form.create()

  
export default class MonitorPnl extends Component {
    state = {
      deviceArr: [{ Value: '0', Icon: RCU, Text: 'light' },
        { Value: '1', Icon: ATU, Text: 'ATU' },
        { Value: '2', Icon: walktour, Text: 'Walktour' },
        { Value: '3', Icon: scout, Text: 'Scout' },
        { Value: '4', Icon: VIP, Text: 'VIP' },
        { Value: '5', Icon: pioneer, Text: 'Pioneer' },
        { Value: '6', Icon: walktourpack, Text: 'WalktourPack' },
        { Value: '7', Icon: indoor_ATU, Text: 'Indoor_ATU' },
        { Value: '8', Icon: scout2, Text: 'Scout2_0' },
        { Value: '9', Icon: light, Text: 'RCU_Light' },
        { Value: '10', Icon: BCU, Text: 'BCU' },
        { Value: '11', Icon: CTU, Text: 'CTU' },
        { Value: '13', Icon: liteprobe, Text: 'Liteprobe' }],
    }

    render(){
         const {detailData} = this.props;
         //const DeviceInfo = detailData.Device; //设备的信息
         const { getFieldDecorator } = this.props.form; 
        //console.log(DeviceInfo)
        //console.log(detailData)

        const formItemLayout = { 
            margin:0,     
            labelCol: {
                xs: { span: 8 },
            },
            wrapperCol: {
                xs: { span: 16 },
            },
        };
        
      const formItemLayout1 = {
          width:'100%'
      };

      const inputNumStyle={
        width:'50%'
      }

      const styleCol = {
        paddingLeft:'3px',
        paddingRight:'3px'
      }

      const styleCard = {
          margin:'0px',
          overflow:'hidden'
      }

      const styleTable = {
          padding:'0px'
      }

      const deviceLayout = {
        labelCol: {
            xs: { span: 4 },
        },
        wrapperCol: {
            xs: { span: 20 },
        }
      }

      const threeLayout = {
        labelCol: {
            xs: { span: 13 },
        },
        wrapperCol: {
            xs: { span: 8 },
        }
      }

      const statusStyle = {
            margin:'15px 0px 0px 13px'
         };


         //设备状态
        const Statusicon = ((val) => {
                let v = parseInt(val.value);
                if(v >=2){
                    let statusDesc = val.val.StatusDescription;
                    return <span><MyIcon iconName={"online"} />{statusDesc}</span>
                }else{
                    return <MyIcon iconName={"offline"} />
                }
            }
        );

        //设备类型
        const Typeicon = ((val) => {
            if(val.value){
                const deviceArr = this.state.deviceArr;
                let icon = {};
                for(let i=0;i<deviceArr.length;i++){
                    let model = deviceArr[i];
                    if(model.Value == val.value ){
                        icon = model.Icon;
                        break;
                    }
                }
                return <img alt={val.value} src={icon} />
            }else{
                return <span></span>
            }
        })

        return(
            <Card bordered={false} style={statusStyle} >
            <div >
            <Row gutter={24}>
            <Col span={14} style={styleCol}>
            <FormItem {...formItemLayout}
            label = "设备ID："> {
                getFieldDecorator('id',{
                    initialValue:(detailData) ? detailData.IdentifierGuid :''
                })(<Input size="small" />
            )
            }
        </FormItem>
            </Col>
            <Col span={9} style={styleCol}>
            <FormItem {...formItemLayout}
            label = "跟踪"> {
                getFieldDecorator('type',{
                })(<Checkbox />
            )
            }
            </FormItem>
            </Col>
            </Row>

            <Row gutter={24}>
            <Col span={14} style={styleCol}>
            <FormItem {...formItemLayout}
            label = "设备名称："> {
                getFieldDecorator('Name',{
                    initialValue: (detailData) ? detailData.Name : ''
                })(<Input size="small" />
            )
            }
        </FormItem>
            </Col>
            <Col span={9} style={styleCol}>
            <FormItem {...formItemLayout}
            label = "类型"> {
                getFieldDecorator('DeviceType',{
                    initialValue:(detailData) ? detailData.DeviceType :''
                })(
                    <Typeicon val={detailData} />
            )
            }
            </FormItem>
            </Col>
            </Row>

            <Row gutter={24}>
            <Col span={14} style={styleCol}>
            <FormItem {...formItemLayout}
            label = "版本："> {
                getFieldDecorator('Version',{
                    initialValue:(detailData) ? detailData.Version :''
                })(<Input  size="small"  />
            )
            }
            </FormItem>
            </Col>
            <Col span={10} style={styleCol}>
            <FormItem {...formItemLayout}
            label = "端口数："> {
                getFieldDecorator('PortNum',{
                    initialValue:(detailData) ? detailData.PortNum : ''
                })(<InputNumber  size="small" 
                style={inputNumStyle} 
               />
            )
            }
            </FormItem>
            </Col>
        </Row>
     <div>

        <span><p style={{color:'rgba(0,0,0,0.45)',marginTop:'5px',height:'10px'}}>设备状态</p></span>
            <Row gutter={24}>
            <Col span={12} style={styleCol}>
            <FormItem {...formItemLayout}
            label = "状态："> {
                getFieldDecorator('Status',{
                    initialValue:(detailData) ? detailData.Status : ''
                })(
                    <Statusicon val={detailData}/>
                )
            }
            </FormItem>
            </Col>
            <Col span={12} style={styleCol}>
            <FormItem {...formItemLayout}
            label = "在线时长"> {
                getFieldDecorator('OnlineDuration',{
                    initialValue:(detailData) ? (detailData.OnlineDuration): ''
                })(<InputNumber  size="small" 
                style={formItemLayout1} 
                precision= {2}
                formatter={value => `${value}h`}
               />
            )
            }
            </FormItem>
            </Col>
            </Row>

            <Row gutter={24}>
            <Col span={12} style={styleCol}>
            <FormItem {...formItemLayout}
            label = "距离"> {
                getFieldDecorator('Distance',{
                    initialValue:(detailData) ? detailData.Distance:0
                })(<InputNumber  size="small" 
                style={formItemLayout1} 
                precision={2}
                formatter={value => `${value}km`} />
            )
            }
            </FormItem>
            </Col>
            <Col span={12} style={styleCol}>
            <FormItem {...formItemLayout}
            label = "速度"> {
                getFieldDecorator('Speed',{
                    initialValue:(detailData) ? detailData.Speed:'0.00'
                })(<InputNumber  size="small" 
                style={formItemLayout1} 
                precision={2} 
                formatter={value => `${value}km/h`} />
            )
            }
            </FormItem>
            </Col>
            </Row>

            <Row gutter={24}>
            <Col span={12} style={styleCol}>
            <FormItem {...formItemLayout}
            label = "经度"> {
                getFieldDecorator('Lat',{   
                    initialValue:  (detailData) ? detailData.Lat:''              
                })(<InputNumber  size="small" 
                style={formItemLayout1} 
                precision={5} />
            )
            }
            </FormItem>
            </Col>
            <Col span={12} style={styleCol}>
            <FormItem {...formItemLayout}
            label = "纬度："> {
                getFieldDecorator('Lng',{
                    initialValue:(detailData) ? detailData.Lng :''
                })(<InputNumber  size="small" 
                style={formItemLayout1} 
                precision={5} />
            )
            }
            </FormItem>
            </Col>
            </Row>
            </div>
        </div>
          </Card>
        )
    }
}
