import { TestBed, inject } from '@angular/core/testing';

import { CardHistoryService } from './card-history.service';

describe('CardHistoryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CardHistoryService]
    });
  });

  it('should be created', inject([CardHistoryService], (service: CardHistoryService) => {
    expect(service).toBeTruthy();
  }));
});
