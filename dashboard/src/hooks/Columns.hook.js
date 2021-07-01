import { useI18n } from './i18n.hook';

const HoprNodeColumns = [
  {
    title: 'HOPR_ADDRESS',
    dataIndex: 'hopr_address',
    id: 'hopr_address',
  },
  {
    title: 'HOPR_STAKED_AMOUNT',
    dataIndex: 'hopr_staked_amount',
    id: 'hopr_staked_amount',
  },
  {
    title: 'CHANNEL_ID',
    dataIndex: 'hopr_address',
    id: 'hopr_channel_id',
  },
  {
    title: 'HOPR_TOTAL_AMOUNT',
    dataIndex: 'hopr_total_amount',
    id: 'hopr_total_amount',
  },
  {
    title: 'HOPR_CHANEL_STATUS',
    dataIndex: 'hopr_chanel_status',
    id: 'hopr_chanel_status',
  },
  {
    title: 'HOPR_TOTAL_CHANNELS',
    dataIndex: 'hopr_total_channels',
    id: 'hopr_total_channels',
  },
  {
    title: 'HOPR_STATUS',
    dataIndex: 'status',
    id: 'hopr_status',
  },
  {
    title: 'HOPR_EPOCH',
    dataIndex: 'hopr_total_amount',
    id: 'hopr_epoch',
  },
  {
    title: 'HOPR_PARTY_B',
    dataIndex: 'hopr_address',
    id: 'party',
  },
  {
    title: 'HOPR_DEPOSIT',
    dataIndex: 'hopr_total_amount',
    id: 'deposit',
  },
];

export function useNodeColumns() {
  const [, t] = useI18n();
  function getColumn(key) {
    let obj = -1;
    for (let item of HoprNodeColumns) {
      if (key === item.id) {
        //Translate title
        obj = {
          ...item,
          title: t(item.title),
        };
      }
    }
    return obj;
  }
  return [HoprNodeColumns, getColumn];
}
