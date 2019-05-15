import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Form, Input, DatePicker, Select, Button, Card, InputNumber, Radio, Icon, Tooltip,
  Tabs,
} from 'antd';
import styles from '../common.less';

const FormItem = Form.Item;
const TabPane = Tabs.TabPane;

const ParamTabs = (item) => {
  return ();
};
export default class SelectParamForm extends PureComponent {
  render() {
    const { alarmEventFormVisible, alarmPnlVisible, eventPnlVisible } = this.props;
    const operations = <Button icon="close"></Button>;
    const dataSource = [{
      title: 'Common',
      columns: [{
        title: '参数名称',
        dataIndex: 'name',
        key: 'name',
      }, {
        title: '阀值分段',
        dataIndex: 'throholds',
        key: 'throholds',
      }],
      key: '1',
    }, {
      title: 'GSM',
      columns: [{
        title: '参数名称',
        dataIndex: 'name',
        key: 'name',
      }, {
        title: '阀值分段',
        dataIndex: 'throholds',
        key: 'throholds',
      }],
      key: '2',
    }];

    return (
      <div className={styles.card}>
        <Tabs type="card" tabBarExtraContent={operations}>
          <List
            size="small"

            dataSource={dataSource}
            renderItem={item => (
              <List.Item>

                <TabPane
                  tab={<span>{item.title}</span>}
                  key={item.key}>
                  <Table columns={item.columns}/>
                </TabPane>

              </List.Item>
            )}
          />
        </Tabs>
      </div>
    );
  }
}
