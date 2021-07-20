import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'antd';
//Hooks
import { useNodeColumns } from '../../hooks/Columns.hook';
import { useNavigation } from '../../hooks/Nav.hook';
import { GET_ACCOUNTS } from '../../graphql';
import { useQuery } from '@apollo/client';

const HoprAddressTable = props => {
  const { data } = useQuery(GET_ACCOUNTS);

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
        dataIndex: 'id',
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
        render(value, record) {
          const { channels } = record;
          const nStacked = channels.reduce((a, b) => a + b.balance, 0);
          return <>{nStacked} HOPR</>;
        },
      },
      {
        ...getCol('hopr_total_channels'),
        render(text, record) {
          const { channels } = record;
          return channels.length;
        },
      },
    ],
    onRow: (record, rowIndex) => {
      return {
        className: rowIndex % 2 === 0 ? 'row-pt' : 'row-wt',
      };
    },
    rowKey: e => e._id || e.hopr_address,
    scroll: { y: '50vh' },
    pagination: {
      simple: true,
      position: ['bottomCenter'],
      pageSize: 7,
    },
    ...props,
  };

  return <Table {...tableProps} dataSource={data.accounts} />;
};

HoprAddressTable.propTypes = {
  props: PropTypes.object,
};

export default HoprAddressTable;
