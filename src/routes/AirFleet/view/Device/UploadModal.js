import React,{PureComponent} from 'react';
import {Modal,Upload, message, Button, Icon} from 'antd';

export  default  class UploadModal extends PureComponent{
  state = {
    fileList:[],
  };

  saveFile = () => {
    const fileList = this.state.fileList;
    if(fileList.length > 0){
      this.props.fetchNavigations();
      this.props.uploadNavigation();
    }else{
      message.error('未上传文件');
    }
  };

handleRemoveFile = (file,fileList) => {
  let index = fileList.indexOf(file);
  let newFileList = fileList.slice();
  newFileList.splice(index,1);
  fileList = newFileList;
  this.setState({
    fileList: fileList
  });
};
  handleChange = (info) =>{
    if (info.file.status === 'uploading') {
      let fileName = info.file.name;
      let fileArr = fileName.split('.');
      let fileType = fileArr[fileArr.length - 1];
      if(fileType === 'zip' || fileType === 'kml' || fileType === 'kmz'){
        info.file.status = 'done';
      }else{
        info.file.status = 'typeError';
      }
    }
    if (info.file.status === 'done') {
      this.setState({
        fileList: info.fileList
      });
      message.success(`${info.file.name} 文件上传成功。`);
    } else if (info.file.status === 'error') {
      this.handleRemoveFile(info.file,info.fileList);
      message.error(`${info.file.name} 文件上传失败。`);
    }else if(info.file.status === 'typeError'){
     this.handleRemoveFile(info.file,info.fileList);
      message.error(`${info.file.name} 文件类型错误，请上传.zip|.kml|.kmz。`)
    }
  };
  render(){
    const {modalVisible} = this.props;
    const props = {
      name: 'file',
      action: '/api/AirFleet/SaveNavigation',
      headers: {
        authorization: 'authorization-text',
      },
      accept:".zip,.kml,.kmz" ,
      onChange:this.handleChange,
    };

    return(
      <Modal
      title = "上传"
      visible = {modalVisible}
      onOk={this.saveFile}
      onCancel={
        () => this.props.uploadNavigation()
      }
      >
        <Upload {...props} fileList={this.state.fileList} style={{display:'flex'}}>
          <Button>
            <Icon type="upload" /> 点击上传
          </Button>
          <p style={{color:'red',margin:'5px'}}>请选择一个文件(.zip|.kml|.kmz)</p>
        </Upload>

      </Modal>
    )
  }

}
