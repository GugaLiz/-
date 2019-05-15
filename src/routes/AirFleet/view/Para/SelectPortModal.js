import React, { Component, Fragment, PureComponent } from 'react';
import { connect } from 'dva';
import { Collapse, Layout, Tooltip, Icon, Button, Table, Radio, Modal, Checkbox, Input, Select } from 'antd';
import { ChartCard, Field } from 'components/Charts';
import Trend from 'components/Trend';

import styles from '../modal.less';

//图标引入
import MyIcon from 'components/MyIcon';

const Search = Input.Search;
const Option = Select.Option;
const Panel = Collapse.Panel;

export default class SelectPortModal extends PureComponent {

  constructor() {
    super();
    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
    };
  }

  /*
  componentWillMount() {
    let selectedPortRowKeys = this.props.selectedPortRowKeys;
    let selectedPortRows = this.props.selectedPortRows;
    console.log("再次进来这个页面获取到父类中的props传来的数据:");
    console.log("selectedRowKeys:");
    console.info(selectedPortRowKeys);
    console.log("selectedRows:")
    console.info(selectedPortRows);
    if (selectedPortRowKeys && selectedPortRows) {
      this.setState({ selectedRowKeys: selectedPortRowKeys, selectedRows: selectedPortRows });
    }
  }
  */
  handleChange = (val) => {
    console.log(`Selected:${val}`);
  };
  //处理数据，根据设备来显示端口信息
  setTable = (data) => {
    var me = this;
    let ids = this.props.deviceIds;
    let tables = [];
    if (ids && ids.length > 0) {
      for (let i = 0; i < ids.length; i++) {
        let id = ids[i];
        for (let j = 0; j < data.length; j++) {
          let devId = data[j].DeviceId;
          let table = [];
          if (devId == id) {
            table.push(data[j]);
          } else {
            table.push(tables);
            break;
          }
        }
      }
    }
  };

  //是否选择0端口
  changeCheck = () => {
    this.props.changeCheck();
  };

  handleOk = () => {
    // console.log('handleOk:');
    let selectedRowsData = this.state.selectedRows;
    // let selectedRowKeys = this.state.selectedRowKeys;
    // console.log("selectedRowKeys:");
    //  console.info(selectedRowKeys);
    // console.log('selectedRows:');
    // console.info(selectedRowsData);
    this.props.getPorts(selectedRowsData);//selectedRowKeys
    this.props.selectPortModal();//把portModal模态框隐藏
  };

  render() {
    const { modalVisible, selectPortModal, portsList } = this.props;
    const { selectedRowKeys, selectedRows } = this.state;
    //console.log(portsList)
    const height = window.innerHeight;
    const rowSelection = {
        selectedRowKeys,
        selection: {},//要选中的key
        onChange: (selectedRowKeys, selectedRows) => {
          // console.log('onChange:');
          // console.log('selectedRowKeys:');
          // console.info(selectedRowKeys);
          // console.log('selectedRows:');
          // console.info(selectedRows);
          this.setState({
            selectedRowKeys: selectedRowKeys,
            selectedRows: selectedRows,
          });
        },
        getCheckboxProps: record => ({
          //disabled: record.name === 'Disabled User', // Column configuration not to be checked
          name: record.name,
        }),
      }
    ;

    const children = [];
    for (let i = 10; i < 36; i++) {
      children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
    }

    const columns = [{
      title: '编号',
      key: 'id',
      dataIndex: '_id',
      render: (val, row) => {
        if (row.GroupName) {
          return {
            children: <p>{row.GroupName}</p>,
            props: {
              colSpan: 3,
            },
          };
        } else {
          let v = val.split('_');
          return v[1];
        }
      },
    }, {
      title: '设备名称',
      dataIndex: 'Name',
      key: 'name',
      render: (val, rec) => {
        const obj = {
          children:<MyIcon type={'device'} value={rec}/>,
          props: {},
        };
        if (rec.GroupName) {
          obj.props.colSpan = 0;
        }
        return obj;
      },
    }, {
      title: '端口',
      dataIndex: 'PortNum',
      key: 'port',
      render: (val, rec) => {
        const obj = {
          children:<MyIcon type={'nettype'} value={rec}/>,
          props: {},
        };
        if (rec.GroupName) {
          obj.props.colSpan = 0;
        }
        return obj;

      },
    }, {
      title: '型号',
      dataIndex: 'Model',
      key: 'model',
      render: (val, rec) => {
        const obj = {
          children: val,
          props: {},
        };
        if (rec.GroupName) {
          obj.props.colSpan = 0;
        }
        return obj;
      },
    }];

    const styleFoot = {
      background: '#f7f7f7',
      borderRadius: 4,
      marginBottom: 24,
      border: 0,
      overflow: 'hidden',
    };

    const TableGrid = ({ portsData }) => {
      return <Table size="small"
                    rowSelection={rowSelection}
                    bordered
                    dataSource={portsData}
                    columns={columns}
                    pagination={false}
      />;
    };
    return (
      <Modal title="选择端口" width='70%'
             visible={modalVisible}
             onOk={this.handleOk}
             onCancel={
               () => this.props.selectPortModal()
             }>
        <ChartCard
          bordered={false}
          footer={
            <div style={{ height: '300px', overflow: 'auto' }}>
              <TableGrid portsData={portsList}/>
            </div>
          }
          contentHeight={16}
        >
          <Trend>
            <Button icon="reload" size="small" style={{ marginRight: '5px' }} onClick={this.deviceModal}>刷新</Button>
            <Checkbox onChange={this.changeCheck} checked={this.props.isChecked}>不显示0端口</Checkbox>
            <Select
              size="small"
              default=""
              onChange={this.handleChange}
              style={{ width: 200 }}
            >
              {children}
            </Select>
          </Trend>
        </ChartCard>
      </Modal>
    );
  }
}
