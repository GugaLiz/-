import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Form, Table,  Card, Radio, Tabs
} from 'antd';

import styles from './AlarmEventForm.less';
import moment, { now } from 'moment';
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;

export default class EventPnl extends PureComponent {
  state = {
    value: 1,
  };

  onChange = (e) => {
    this.setState({
      value: e.target.value,
    });

    //切换
    this.props.handleChangeEvent(e.target.value);
  };

  //切换table页
  changePage = (pageNum) => {
    this.props.getPageNum(1, pageNum);
  };

  render() {
    const { eventList, handleChangeEvent } = this.props;
    let data = [];
    let total = 0;
    if (eventList) {
      data = eventList.data;
      total = eventList.total;
    }
    const height = window.innerHeight;

    const styleTable = {
      height: height - 136,
    };

    const columns = [{
      title: '设备端口',
      dataIndex: 'Name',
      key: 'port',
      width: '80px',
    }, {
      title: '事件时间',
      dataIndex: 'EventDT',
      key: 'time',
      width: '85px',
      render: (val) => {
        let time = moment(val).format('HH:mm:ss');
        return time;
      },
    }, {
      title: '事件名称',
      dataIndex: 'Content',
      key: 'name',
      //width: '170px',
    }];

    const paginationProps = {
      onChange: this.changePage,
      total: total,
      size: 'small',
      pageSize: 50,
      showQuickJumper: true,
      showTotal: (total, range) => `${range[0]}-${range[1]}条，共 ${total} `,
    };
    return (
      <Card bordered={false} style={{ height: height - 100 }}>

        <RadioGroup onChange={this.onChange} defaultValue={this.state.value}>
          <Radio value={1}>实时事件</Radio>
          <Radio value={0}>解码事件</Radio>
        </RadioGroup>
        <Table size="small"
               //bordered
               loading={this.props.loading}
               style={styleTable}
               scroll={{ y: height - 175 }}
               columns={columns}
               dataSource={data}
               pagination={paginationProps}
        />

      </Card>
    );
  }
}
