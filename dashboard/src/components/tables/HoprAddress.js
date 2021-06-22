import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'antd';
//Hooks
import { useNodeColumns } from '../../hooks/Columns.hook';
import { useNavigation } from '../../hooks/Nav.hook';

const HoprAddressTable = props => {
  const [, getCol] = useNodeColumns();
  const [, nav] = useNavigation();
  const tableProps = {
    columns: [
      {
        title: '#',
        width: 60,
        dataIndex: 'hopr_address',
        render(test, record, index) {
          return index + 1 + '.';
        },
      },
      {
        ...getCol('hopr_address'),
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
        render(value) {
          return <>{value} HOPR</>;
        },
      },
      {
        ...getCol('hopr_total_channels'),
        render(text) {
          return text + ' HOPR';
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

HoprAddressTable.propTypes = {
  props: PropTypes.object,
};

export default HoprAddressTable;
