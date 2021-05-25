import { TestBed } from '@angular/core/testing';
import { AppModule } from '../app.module';
import { ChainTxEventType } from '../enums/chain.enum';
import { ConfigService } from '../services/config.service';

describe('ConfigService', () => {
  let configService: ConfigService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [AppModule]
    });
    configService = TestBed.inject(ConfigService);
    await configService.initAsync();
  });

  it('should be created', async () => {
    expect(configService).toBeTruthy();
    expect(configService.config).toBeDefined();
  });

  it('should map transaction event type to string', async () => {
    const config = configService.config;
    expect(config.chains[0].mapTxEventTypeToString(ChainTxEventType.BURN)).toBeUndefined();
    expect(config.chains[1].mapTxEventTypeToString(ChainTxEventType.BURN)).toBe('Burned(address,address,uint256,bytes,bytes)');
    expect(config.chains[2].mapTxEventTypeToString(ChainTxEventType.BURN)).toBe('Burn(address,uint256)');
  });

  it('should map transaction event signature to type', async () => {
    const config = configService.config;
    expect(config.chains[0].mapTxEventSignatureToType(undefined)).toBe(ChainTxEventType.UNKNOWN);
    expect(config.chains[0].mapTxEventSignatureToType('')).toBe(ChainTxEventType.UNKNOWN);
    expect(config.chains[1].mapTxEventSignatureToType('Burned(address,address,uint256,bytes,bytes)')).toBe(ChainTxEventType.BURN);
    expect(config.chains[2].mapTxEventSignatureToType('Burn(address,uint256)')).toBe(ChainTxEventType.BURN);
  });
});
