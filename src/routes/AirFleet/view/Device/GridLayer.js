import React, { Component, Fragment, PureComponent } from 'react';
import { connect } from 'dva';
import { Table } from 'antd';

export default class GridLayer extends PureComponent{
  state = {
    selectedRowKeys:[],
    selectedRows:[]
  };

  changePage =(pageNum)=>{
    this.props.getPageNum(1,pageNum);
  };
    render(){
      const {listGridsList} = this.props;
      let total = 0;
      let datas = [];
      datas.unshift({Name: 'No Grid Layer', Value: ''});
      if(listGridsList.total > 0){
        datas = datas.concat(listGridsList.datas);
        total = listGridsList.total;
      }
        const columns = [{
            title:'图层名称',
            dataIndex:'Name',
            key:'layerName'
        }];
      const rowSelection = {
        type:'radio',
        fixed:false,
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
        pageSize:15,
        total:total,
        size:"small",
        showQuickJumper: true,
        showTotal:(total, range) => `${range[0]}-${range[1]}条，共 ${total} 条`
      };
        return (
            <Table size="small"
             columns={columns}
                   dataSource={datas}
                   rowSelection={rowSelection}
                   pagination={paginationProps}
            >
            </Table>
        )
    }
}
