import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Layout, Tooltip, Icon, Button, Table, Radio, Form, Input, Row, Col, Checkbox, InputNumber, Card } from 'antd';
import numeral from 'numeral';
import { ChartCard, Field } from 'components/Charts';
import Trend from 'components/Trend';

import styles from './DetailPnl.less';
import { Meta } from 'antd/lib/list/Item';

//图标引入
import MyIcon from 'components/MyIcon';

const FormItem = Form.Item;

@Form.create()
export default class PortGrid extends Component {
  state = {
  };

  render() {
    const { detailPnl, detailPnlVisible, portDatas } = this.props;
    const height = window.innerHeight * 0.6;

    let data = [];
    if (portDatas) {
      let ports = portDatas.Ports;
      for (let i in ports) {
        let p = ports[i];
        data.push(p);
      }
    }
    //console.log(data);
    const styleTable = {
      height: height - 100,
      margin: '8px',
      fontSize: '12px',
    };

    const detailColumns = [{
      title: '端口',
      //fixed:'left',
      dataIndex: 'PortNum',
      key: 'port',
      width: '71px',
      render: (val, rec) => {
        return <MyIcon type={'nettype'} value={rec}/>
      },
    }, {
      title: '',
      // fixed:'left',
      dataIndex: 'isCheck',
      key: 'radio',
      width: '35px',
      render: val => {
        if (val === 1) {
          <Radio style={{ width: '2px' }} value={1}></Radio>;
        }
        return <Radio style={{ width: '2px' }}></Radio>;
      },
    }, {
      title: '网络',
      // fixed:'left',
      dataIndex: 'CNetwork',
      key: 'currentNetwork',
      width: '71px',
      render: val => {
        if (val) {
          return val;
        } else {
          return '-';
        }
      },
    }, {
      title: '参数值1',
      // fixed:'left',
      dataIndex: 'Para1Name',
      key: 'param1',
      width: '107px',
      render: (val, rec) => {
        if (val && rec.Para1Value) {
          return val + ':' + rec.Para1Value;
        } else {
          return '-';
        }
      },
    }, {
      title: '参数值2',
      //fixed:'left',
      dataIndex: 'Para2Name',
      key: 'param2',
      width: '107px',
      render: (val, rec) => {
        if (val && rec.Para1Value) {
          return val + ':' + rec.Para2Value;
        } else {
          return '-';
        }
      },
    }];

    return (
      <Table size="small"
        //bordered
             scroll={{ y: height - 100 }}
             style={styleTable}
             columns={detailColumns}
             dataSource={data}
             pagination={false}
      />
    );
  }
}
