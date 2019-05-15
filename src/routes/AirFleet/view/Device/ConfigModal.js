import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Form, Input, DatePicker, Select, Button, Card, InputNumber, Radio, Icon, Tooltip,
  Tabs, Modal
} from 'antd';
import styles from '../common.less';

import GridLayer from './GridLayer';
import NavigationLayer from './NavigationLayer';

const FormItem = Form.Item;
const TabPane = Tabs.TabPane; 

export default class Config extends PureComponent {

  changeKey = (key) => {
    if(key == 1){
      this.props.fetchGrid(1);
    }else if(key == 2){
      this.props.fetchNavigations(1);
    }
  };
  fetchNavigations = ()=>{
    this.props.fetchNavigations();
  };
  getPageNum = (type,pageNum) =>{
    this.props.getSettingPageNum(type,pageNum);
  };
    render() {
        const {modalVisible,configModal,navigationsList, listGridsList} = this.props;
        const parentMethods = {
          navigationsList:navigationsList,
          listGridsList:listGridsList,
          fetchNavigations:this.fetchNavigations,
          fetchGrid:this.fetchGrid,
          getPageNum:this.getPageNum,
        }

        const okHandle = () =>{
            console.log('xx')
        }
        return (
            <Modal width="70%"
            title="配置"
            visible = {modalVisible}
            onOk = {okHandle}
            onCancel = {
                () => this.props.handleConfigVisible()
            }
            >
            <Tabs type="card" onChange={this.changeKey}>
            <TabPane tab="网格图层" key="1">
            <GridLayer {...parentMethods} />
            </TabPane>
            <TabPane tab="道路轨迹" key="2">
            <NavigationLayer {...parentMethods} />
            </TabPane>
            </Tabs>
            </Modal>
        )
    }
}
