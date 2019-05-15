import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Form, Input, DatePicker, Select, Button, Card, InputNumber, Radio, Icon, Tooltip,
  Tabs, Modal, Table,
} from 'antd';
import styles from '../common.less';
import { json } from 'graphlib';

const FormItem = Form.Item;
const TabPane = Tabs.TabPane;

@connect(({ airfleet, loading }) => ({
  airfleet,
  loading: loading.models.airfleet,
}))
export default class SelectParam extends PureComponent {

  state = {
    data: [],
    selectedRowKeys: [],
    selectedRows: [],
  };

  changeTab = (netType) => {
    this.props.fetchPara(netType);
  };

  //处理参数阀值分段的显示
  getThrholdsDiv = (thresholds, scale) => {
    let html = {};
    let divColor = '';
    if (thresholds) {
      if (!scale) {
        scale = 1;
      }
      html = thresholds.map((thr) => ({
          divColor: '#' + thr.Color.toString().replace('0x', '').replace('#', ''),
          divThr: thr.ThrStr,
        }
      ));
    }

    let htmlDiv = html.map(it => (
      <span style={{ color: it.divColor }}>{it.divThr}</span>
    ));

    return htmlDiv;

  };

  //从集合中删除一个值
  deleteSelectedRow = (oldRowSelection, Id) => {
    for (let i = 0; i < oldRowSelection.length; i++) {
      if (oldRowSelection[i].Id == Id) {
        oldRowSelection.splice(i, 1);
      }
    }
  };

// insertDatas必须是相同tab页下的也就是说全部都是相同 netType的,(删除nettype相同的然后把用户选的重新插入)
  createOrRemoveSelectRow = (oldRowSelection, record, selected) => {
    //判断是哪个NetType，旧的查询netType相同出来，全部清除然后重新插入
    let netType = record.NetType;
    /*
      //清除 旧的netType相同的
      for (let i = 0; i < oldRowSelection.length; i++) {
        if (oldRowSelection[i].NetType == netType) {
          oldRowSelection.splice(i, 1);
        }
      }
      */

    if (selected) {
      oldRowSelection.push(record);
      this.setState({
        selectedRows:oldRowSelection
      });
      // console.log('add记录：');
      // console.info(record);
    } else {
      this.deleteSelectedRow(oldRowSelection, record.Id);
      // console.log('删除记录：');
      // console.info(record);
    }
    return oldRowSelection;
  };
//点击全选或者反选时 操作oldRowSelection 向里面加值或者减值
  onSelectAllAddOrDel = (oldRowSelection, changeRows, selected) => {
    if (selected) {
      //oldRowSelection = oldRowSelection.concat(changeRows);
      oldRowSelection = changeRows;
    } else {
      for (let i = 0; i < changeRows.length; i++) {
        this.deleteSelectedRow(oldRowSelection, changeRows[i].Id);
      }
    }
    return oldRowSelection;
  };

  /*
    //是否存在然后把不存在的加入进来
    insertValue = (dataSource, value) => {
      if (!this.checkExit(dataSource, value.Id)) {
        dataSource.push(value);
      }
    };

    checkExit = (dataSrouce, id) => {
      for (let i = 0; i < dataSrouce.length; i++) {
        if (dataSrouce[i].Id == id) {
          return true;
          break;
        }
      }
      return false;
    };
  */

  render() {
    const { modalVisible, selectParamModal, paraList, fetchPara } = this.props;
    let data = [];
    if (this.props.paraSelectData) {
      data = this.props.paraSelectData.datas;
    }
    const okHandle = () => {
      const selectedRowsData = this.state.selectedRows;
      this.props.getParams(selectedRowsData);//selectedRowKeys
      this.props.selectParamModal();//把ParamModal模态框隐藏
    };
    const { selectedRowKeys, selectedRows } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onSelectAll: (selected, currentSelectedRows, changeRows) => {
        // console.log('rowSelection onSelectAll:');
        // console.log('selected:');
        // console.info(selected);
        // console.log('selectedRows:');
        // console.info(selectedRows);
        // console.log('changeRows:');
        // console.info(changeRows);
        let oldRowSelection = selectedRows;
        oldRowSelection = this.onSelectAllAddOrDel(oldRowSelection, changeRows, selected);
        this.setState({
          selectedRows: oldRowSelection,
        });
        // console.log('onSelectAll=>oldRowSelection:');
        // console.info(oldRowSelection);
      },
      onSelect: (record, selected, currentSelectedRows, nativeEvent) => {
        // console.log('rowSelection onSelect:');
        // console.log('record:');
        // console.info(record);
        // console.log('selected:');
        // console.info(selected);
        // console.log('currentSelectedRows:');
        // console.info(currentSelectedRows);
        // console.log('nativeEvent:');
        // console.info(nativeEvent);
        let oldRowSelection = selectedRows;
        oldRowSelection = this.createOrRemoveSelectRow(oldRowSelection, record, selected);
        // console.log('oldRowSelection:');
        // console.info(oldRowSelection);
        // this.setState({
        //   selectedRows: oldRowSelection,
        // });
      },
      onChange: (selectedRowKeys, currentSelectedRows) => {
        // console.log('SelectParam onChange:');
        // console.info(selectedRows);
        this.setState({
          selectedRowKeys: selectedRowKeys,
        });
      },
      getCheckboxProps: record => ({
        //disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name,
      }),
    };

    const columns = [{
      title: '参数名称',
      dataIndex: 'Name',
      key: 'paramName',
      width: '100px',
    }, {
      title: '阀值分段',
      dataIndex: 'ThresholdsStr',
      key: 'threholds',
      render: (val, rec) => {
        var scale = rec.Scale;
        var thresholds = eval('(' + val + ')');
        if (thresholds) {
          return this.getThrholdsDiv(thresholds, scale);
        }
        return val;
      },
    }];
    return (
      <Modal width="70%"
             title="选择参数"
             visible={modalVisible}
             onOk={okHandle}
             onCancel={
               () => this.props.selectParamModal()
             }
      >
        <Tabs type="card" defaultActiveKey='-1' onChange={this.changeTab}>
          <TabPane tab="Common" key="-1">
            <Table size="small"
                   rowSelection={rowSelection}
                   bordered
                   scroll={{ y: 300 }}
                   dataSource={data}
                   columns={columns}>
            </Table>
          </TabPane>
          <TabPane tab="GSM" key="0">
            <Table size="small"
                   rowSelection={rowSelection}
                   bordered
                   scroll={{ y: 300 }}
                   dataSource={data}
                   columns={columns}
                   pagination={false}
            >
            </Table>
          </TabPane>
          <TabPane tab="CDMA" key="1">
            <Table size="small"
                   rowSelection={rowSelection}
                   bordered
                   scroll={{ y: 300 }}
                   dataSource={data}
                   columns={columns}
                   pagination={false}
            >
            </Table>
          </TabPane>
          <TabPane tab="WCDMA" key="2">
            <Table size="small"
                   rowSelection={rowSelection}
                   bordered
                   scroll={{ y: 300 }}
                   dataSource={data}
                   columns={columns}
                   pagination={false}
            >
            </Table>
          </TabPane>
          <TabPane tab="TDSCDMA" key="3">
            <Table size="small"
                   rowSelection={rowSelection}
                   bordered
                   scroll={{ y: 300 }}
                   dataSource={data}
                   columns={columns}
                   pagination={false}
            >
            </Table>
          </TabPane>
          <TabPane tab="LTE" key="7">
            <Table size="small"
                   rowSelection={rowSelection}
                   bordered
                   scroll={{ y: 300 }}
                   dataSource={data}
                   columns={columns}
                   pagination={false}
            >
            </Table>
          </TabPane>
          <TabPane tab="WIFI" key="5">
            <Table size="small"
                   rowSelection={rowSelection}
                   bordered
                   scroll={{ y: 300 }}
                   dataSource={data}
                   columns={columns}
                   pagination={false}
            >
            </Table>
          </TabPane>
        </Tabs>
      </Modal>
    );
  }
}
