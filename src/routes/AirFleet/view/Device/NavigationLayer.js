import React, { Component, Fragment, PureComponent } from 'react';
import { connect } from 'dva';
import { Radio,Button,Table } from 'antd';
import { ChartCard, Field } from 'components/Charts';
import Trend from 'components/Trend';
import  UploadModal from  './UploadModal';
import styles from './DeviceModal.less';

export default class NavigationLayer extends PureComponent{
  state = {
    uploadModalVisible:false,
    selectedRowKeys:[],
    selectedRows:[]
  };

  uploadNavigation = () => {
    this.setState({
      uploadModalVisible:!this.state.uploadModalVisible
    });
  };

  fetchNavigations = () => {
    this.props.fetchNavigations();
  };

  deleteNavigation = () => {
    let selectRow = this.state.selectedRows;
    let value = selectRow[0].Value;
    let url = '/api/AirFleet/DeleteNavigation';
    fetch(url,{
      credentials: 'include',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body:'ids='+ value
    })
      .then((resp) => resp.json())
      .then((respData) => {
        this.fetchNavigations();
      })
      .catch((error) => {
        console.log(error);
      })
  };
  changePage =(pageNum)=>{
    this.props.getPageNum(2,pageNum);
  };
    render(){
      const {navigationsList} = this.props;
      let total = 0;
      let datas = [];
      datas.unshift({Name: 'No Navigation Layer', Value: ''});
      if(navigationsList.total > 0){
        datas = datas.concat(navigationsList.datas);
        total = navigationsList.total;
      }
        const columns = [{
            title:'图层名称',
            dataIndex:'Name',
            key:'layerName'
        }];
        const parentMethod = {
          uploadNavigation:this.uploadNavigation,
          fetchNavigations:this.fetchNavigations
        };
      const rowSelection = {
        type:'radio',
        selections:true,
        onChange: (selectedRowKeys, selectedRows) => {
          this.setState({
            selectedRowKeys: selectedRowKeys,
            selectedRows: selectedRows,
          });
        },
        getCheckboxProps: record => ({
          name: record.name,
        }),
      };
      const paginationProps = {
        onChange:this.changePage,
        pageSize:25,
        total:total,
        size:"small",
        showQuickJumper: true,
        showTotal:(total, range) => `${range[0]}-${range[1]}条，共 ${total} 条`
      };
        return(
          <div>
            <ChartCard
            bordered={false}
              footer={
                <Table size="small"
                columns={columns}
                       dataSource={datas}
                       rowSelection={rowSelection}
                pagination={paginationProps}
                 />}
              contentHeight={16}
              >    
              <Trend>
              <Button icon="upload" size="small" style={{marginRight:'5px'}} onClick={this.uploadNavigation} >上传</Button>
              <Button icon="delete" size="small" style={{marginRight:'5px'}} onClick={this.deleteNavigation}>删除</Button>
              </Trend>      
            </ChartCard>
            <UploadModal {...parentMethod} modalVisible={this.state.uploadModalVisible} > </UploadModal>
          </div>
        )
    }
}
