import React, { Component, Fragment, PureComponent } from 'react';
import { connect } from 'dva';
import { Icon, Button, Table,  Modal, Checkbox, Input } from 'antd';
import { ChartCard, Field } from 'components/Charts';
import Trend from 'components/Trend';
import StandardTable from 'components/StandardTable';

import styles from './DeviceModal.less';

//图标引入
import MyIcon from 'components/MyIcon';

const Search = Input.Search;

export default class DeviceModal extends PureComponent {
  state = {
    selectedRowKeys: [],
    selectedRows: []
  };

  changeOnline = () => {
    this.props.changeOnline();
  };

  handleSelectRows = (rows) => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleSubmit = () => {
    let selectRowsId = [];
    (this.state.selectedRows).map((item) => {
      selectRowsId.push(item.DeviceId);
    });
    this.props.getId4Status(this.state.selectedRows, selectRowsId);
    this.props.handleDeviceVisible();
  };

  changePage = (pageNum) => {
    this.props.getPageNum(pageNum);
  };

  render() {
    const { deviceList, modalVisible,  checkedVal } = this.props;
    let data = [];
    let total = 0;
    if (deviceList) {
      data = deviceList.datas;
      total = deviceList.total;
    }

    const h = window.innerHeight;

    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys: selectedRowKeys,
          selectedRows: selectedRows,
        });
      },
      getCheckboxProps: record => ({
        //disabled: record.name === 'Disabled User', // Column configuration not to be checked
        key: record.key,
        name: record.name,
      }),
    };

    const columns = [{
      title: '设备名称',
      dataIndex: 'Name',
      key: 'Name',
      width: 210,
      render: (val, rec) => {
        return <MyIcon type={'device'} value={rec}/>;
      },
    }, {
      title: '状态',
      dataIndex: 'Status',
      key: 'Status',
      width: 40,
      render: (val) => {
        if (val && parseInt(val) >= 2) {
          return <MyIcon iconName={'online'}/>;
        } else {
          return <MyIcon iconName={'offline'}/>;
        }
      },
    }, {
      title: '当前在线时长（小时）',
      dataIndex: 'OnlineDuration',
      key: 'OnlineDuration',
      width: 120,
      render: (val) => {
        if (val) {
          let v = parseFloat(val);
          return v.toFixed(2);
        }

      },
    }, {
      title: '速度',
      dataIndex: 'Speed',
      key: 'Speed',
      width: 70,
      render: (val) => {
        if (val) {
          return val + 'km/h';
        }
        return '-';
      },
    }, {
      title: '设备版本',
      dataIndex: 'Version',
      key: 'Version',
      width: 100,
    }];

    const paginationProps = {
      onChange: this.changePage,
      pageSize: 15,
      total: total,
      size: 'small',
      showQuickJumper: true,
      defaultCurrent:1,
      showTotal: (total, range) => `${range[0]}-${range[1]}条，共 ${total} 条`,
    };
    return (

      <Modal title="选择设备" width='70%'
             visible={modalVisible}
             onOk={this.handleSubmit}
             onCancel={
               () => this.props.handleDeviceVisible()
             }>
        <ChartCard style={{ padding: '0px' }}
                   bordered={false}
                   footer={
                     <Table size="small"
                            scroll={{ y: h - 350 }}
                            rowSelection={rowSelection}
                            columns={columns}
                            dataSource={data}
                            pagination={paginationProps}
                     />
                   }
                   contentHeight={16}
        >
          <Trend>
            <Button icon="reload" size="small" style={{ marginRight: '5px' }} onClick={this.deviceModal}>刷新</Button>
            <Checkbox onChange={this.changeOnline} checked={checkedVal}>只显示在线</Checkbox>
            <Search
              size="small"
              label="查询："
              onSearch={value => this.props.setQuery(value)}
              style={{ width: 200 }}
            />
          </Trend>
        </ChartCard>
      </Modal>
    );
  }
}
