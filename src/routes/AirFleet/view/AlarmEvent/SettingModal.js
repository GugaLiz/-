import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Form, Input, DatePicker, Select, Button, Card, InputNumber, Radio, Icon, Tooltip,
  Tabs, Modal, Collapse, List, Spin, Row, Col,
} from 'antd';
import styles from './SettingModal.less';

const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
const Panel = Collapse.Panel;
const Option = Select.Option;
const { RangePicker } = DatePicker;
@Form.create() //配合const { getFieldDecorator } = this.props.form;使用

export default class SettingModal extends PureComponent {
  state = {
    devPortsPnl: [],
    devPortLists:[],
    children:[]
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let params = {};
        let alarmSettingParams = null;
        let encodeEventParams = null;
        let realEventParams = null;
        let timeRange = {};
        let settings = {};
         realEventParams = {
          timeRange: values.realEventTimeRange,
          devPort:  values.realEventDev,
          //settings: values.realEventSettings,
        };
        params.realEventParams = realEventParams;

         encodeEventParams = {
          timeRange: values.encodeEventTimeRange,
          devPort:  values.encodeEventDev,
          //settings: values.encodeEventSettings,
        };
        params.encodeEventParams = encodeEventParams;

         alarmSettingParams = {
          timeRange: values.alarmTimeRange,
          devPort: values.alarmDev,
          //settings: values.alarmSetting,
        };
        params.alarmSettingParams = alarmSettingParams;
        //console.info(realEventParams, encodeEventParams, alarmSettingParams);
        //fetch filterData
        if(params){
          this.props.setFilteredParams(params);
        }
      }
    });
    this.props.handleSettingVisible();
  };



  render() {
    const { modalVisible, settingModal } = this.props;
    const { getFieldDecorator } = this.props.form;

    const formItemLayout = {
      margin: 0,
      labelCol: {
        xs: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 16 },
      },
    };

    const children = [];
    let devPortLists = this.props.devPortLists;  //children这段替换成后台处理出来的数据
    if(devPortLists){
      devPortLists.map((item) => {children.push(<Option key={item}>{item}</Option>)});
    }


    const realEventTab = (
      <div className={styles.eventTab}>
        <Row gutter={12} style={{ margin: '0px 450px 8px 0px' }}>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label="时间段"
            >
              {getFieldDecorator('realEventTimeRange')(
                <RangePicker showTime format="YYYY-MM-DD HH:mm:ss"/>,
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={6} style={{ paddingRight: '0',marginBottom:'5px' }}>
            <FormItem
              {...formItemLayout}
              label="设备-端口 "
            >
              {getFieldDecorator('realEventDev', {})(
                <Select
                  mode="multiple"
                  style={{ width: '350px' }}
                  placeholder="请选择设备"
                >
                  {children}
                </Select>,
              )}
            </FormItem>

          </Col>
        </Row>

        {/*
         <Row gutter={12} style={{ margin: '8px 0px 5px -90px' }}>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label="事件名称 "
            >
              {getFieldDecorator('realEventSettings', {})(
                <Select
                  mode="multiple"
                  style={{ width: '350px' }}
                  placeholder="请选择实时事件"
                >
                  {this.state.children}
                </Select>,
              )}
            </FormItem>
          </Col>
        </Row>
        */}

      </div>
    );

    const encodeEventTab = (
      <div className={styles.eventTab}>
        <Row gutter={12} style={{ margin: '0px 450px 8px 0px' }}>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label="时间段"
            >
              {getFieldDecorator('encodeEventTimeRange')(
                <RangePicker showTime format="YYYY-MM-DD HH:mm:ss"/>,
              )}
            </FormItem>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={6} style={{ paddingRight: '0',marginBottom:'5px'}}>
            <FormItem
              {...formItemLayout}
              label="设备-端口"
            >
              {getFieldDecorator('encodeEventDev', {})(
                <Select
                  mode="multiple"
                  style={{ width: '350px' }}
                  placeholder="请选择设备"
                >
                  {children}
                </Select>,
              )}
            </FormItem>

          </Col>
        </Row>

        {/*
        <Row gutter={12} style={{ margin: '8px 0px 5px -90px' }}>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label="事件名称 "
            >
              {getFieldDecorator('encodeEventSettings', {})(
                <Select
                  mode="multiple"
                  style={{ width: '350px' }}
                  placeholder="请选择解码事件"
                >
                  {this.state.children}
                </Select>,
              )}
            </FormItem>

          </Col>
        </Row>
        */}
      </div>
    );

    const alarmSetting = (
      <div>
        <Row gutter={12} style={{ margin: '0px 450px 8px 0px' }}>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label="时间段"
            >
              {getFieldDecorator('alarmTimeRange')(
                <RangePicker showTime format="YYYY-MM-DD HH:mm:ss"/>,
              )}
            </FormItem>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={6} style={{ paddingRight: '0' }}>
            <FormItem
              {...formItemLayout}
              label="设备-端口 "
            >
              {getFieldDecorator('alarmDev', {})(
                <Select
                  mode="multiple"
                  style={{ width: '350px' }}
                  placeholder="请选择设备"
                >
                  {children}
                </Select>,
              )}
            </FormItem>
          </Col>
        </Row>

        {/*
        <Row gutter={12} style={{ margin: '8px 0px 5px -90px' }}>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label="告警设置 "
            >
              {getFieldDecorator('alarmSetting', {})(
                <Select
                  mode="multiple"
                  style={{ width: '350px' }}
                  placeholder="请选择告警设置"
                >
                  {this.state.children}
                </Select>,
              )}
            </FormItem>

          </Col>
        </Row>
        */}
      </div>
    );


    return (
      <Modal width="912px"
             title="设置"
             visible={modalVisible}
             onOk={this.handleSubmit}
             onCancel={
               () => this.props.handleSettingVisible()
             }
      >
        <Collapse defaultActiveKey={['1']}>
          <Panel header="事件设置" key="1">
            <Tabs>
              <TabPane tab="实时事件" key="realEvent">{realEventTab}</TabPane>
              <TabPane tab="解码事件" key="encodeEvent">{encodeEventTab}</TabPane>
            </Tabs>
          </Panel>

          <Panel header="告警设置" key="2">
            {alarmSetting}
          </Panel>
        </Collapse>
      </Modal>
    );
  }
}
