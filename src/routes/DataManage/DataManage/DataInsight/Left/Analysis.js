import  React,{Component} from 'react';
import { ChartCard, Field } from 'components/Charts';
import KPIWave from '../Analysis/KPIWave';
import FileGridWin from '../Win/FileGridWin';


export default class Analysis extends Component{
  state = {
    KPIWaveVisible:false
  }

  setKPIWaveVisible = (flag) => {
    let me = this;
    me.setState({
      KPIWaveVisible : !!flag
    });
  };

  render(){

    const style = {
      //display: display,
      width: '230px',
      // height: height,
      paddingLeft: '0px',
    };

    const parentMethods = {
      handleKPIWaveVisible:this.setKPIWaveVisible
    };

    return (
      <div style={style}>
        <ChartCard
          style={style}
          bordered={true}
          title="分析项"

          footer={
            <button onClick={this.setKPIWaveVisible}>指标波动分析</button>
          }
        />
        <KPIWave {...parentMethods}
                 modalVisible={this.state.KPIWaveVisible}
        />
      </div>
    )
  }

}
