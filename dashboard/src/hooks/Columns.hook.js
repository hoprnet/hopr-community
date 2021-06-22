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
