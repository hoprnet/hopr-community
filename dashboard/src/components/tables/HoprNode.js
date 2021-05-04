import React from 'react';
import PropTypes from 'prop-types';
import { Table, Badge } from 'antd';
//Hooks
import { useNodeColumns } from '../../hooks/Columns.hook';
import { useNavigation } from '../../hooks/Nav.hook';

const HoprNodeTable = props => {
  const [, getCol] = useNodeColumns();
  const [, nav] = useNavigation();
  const tableProps = {
    columns: [
      {
        title: '',
        dataIndex: 'hopr_address',
        render(test, record, index) {
          return index + 1 + '.';
        },
      },
      {
        ...getCol('hopr_address'),
        className: 'hopr-title',
        render(value) {
          return (
            <span
              className="hopr-address"
              onClick={() => nav(`/node?address=${value}`)}
            >
              {value}
            </span>
          );
        },
      },
      {
        ...getCol('hopr_staked_amount'),
        align: 'center',
        className: 'hopr-title',
        render(value) {
          return <div className="hopr-staked">{value} HOPR</div>;
        },
      },
      {
        ...getCol('hopr_total_amount'),
        align: 'center',
        className: 'hopr-title',
        render(value) {
          return <div className="hopr-staked">{value} HOPR</div>;
        },
      },
      {
        ...getCol('hopr_chanel_status'),
        align: 'center',
        className: 'hopr-title',
        render() {
          return (
            <div>
              <Badge color="green" dot text="Open"></Badge>
            </div>
          );
        },
      },
    ],
    onRow: (record, rowIndex) => {
      return {
        className: rowIndex % 2 === 0 ? 'row-pt' : 'row-wt',
      };
    },
    rowKey: e => e._id || e.hopr_address,
    pagination: false,
    scroll: { y: '50vh' },
    ...props,
  };
  return <Table {...tableProps} />;
};

HoprNodeTable.propTypes = {
  props: PropTypes.object,
};

export default HoprNodeTable;
