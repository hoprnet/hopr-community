import { TestBed } from '@angular/core/testing';
import { AppModule } from '../app.module';
import { ChainTxEventType } from '../enums/chain.enum';
import { ConfigService } from '../services/config.service';
import { ChainProxy } from './chain.proxy';

describe('ChainProxy', () => {
  let proxy: ChainProxy;
  let configService: ConfigService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [AppModule]
    });
    proxy = TestBed.inject(ChainProxy);
    configService = TestBed.inject(ConfigService);
    await configService.initAsync();
  });

  it('should be created', async () => {
    expect(proxy).toBeTruthy();
  });

  it('should get transaction event name', async () => {
    expect(proxy.getTxEventName(configService.config.chains[0], ChainTxEventType.BURN)).toBeUndefined();
    expect(proxy.getTxEventName(configService.config.chains[1], ChainTxEventType.BURN)).toBe('Burned');
    expect(proxy.getTxEventName(configService.config.chains[2], ChainTxEventType.BURN)).toBe('Burn');
  });
});
