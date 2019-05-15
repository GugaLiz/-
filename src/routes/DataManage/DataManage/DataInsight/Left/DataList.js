import React,{Component} from 'react';
import { Layout, Tooltip, Icon, Button, Table, Radio, Divider, Badge } from 'antd';
import { ChartCard, Field } from 'components/Charts';
import FileGridWin from '../Win/FileGridWin';
const { Sider, Content } = Layout;

export default class DataList extends Component{
  state = {
    fileGridWinVisible:false
  };

  setFileGridVisible = (flag) => {
    let me = this;
    me.setState({
      fileGridWinVisible : !!flag
    });
  };

  deleteName = () => {

  };

  render(){
    const {FileData} = this.props;
    //const {FileName} = FileData
    //console.info(FileData);
    //let fileName = FileData.FileName;
    const h = window.innerHeight;
    const height = 0.2 * h;

    const style = {
      //display: display,
      width: '100%',
     // height: height,
      paddingLeft: '0px',
    };

    const columns = [{
      dataIndex:'Name',
      renderer:(val,rec) => {
        let html = '';

        if(rec.MOMTType === 1 || rec.MOMTType === 2){
          html = html + <span style={{color:"red"}}>(rec.MOMTType == 1) ? "主叫" : "被叫"</span>
        }

        if (typeof (port) != 'undefined'){
          html = html + <span style={{color:"green"}}>"p" + rec.data.Port</span> + <span>val</span>;
        }else{
          html = html + <span>val</span>
        }

        return html;
      }
    },{
      renderer:() => (
        <Icon type="delete" onClick={this.deleteName} />
      )

    }];

    const parentMethods = {
      handleFileGridVisible:this.setFileGridVisible
    };

    return (<div style={style}>
      <ChartCard
        style={style}
        bordered={true}
        title="数据列表"
        action={
          <Tooltip title="">
            <Icon type="setting" onClick={this.setFileGridVisible}/>
          </Tooltip>
        }
        footer={
          <p>fff</p>
        }
        />
        <FileGridWin
          {...parentMethods}
          modalVisible={this.state.fileGridWinVisible}
        />
      </div>
      )
  }

}
