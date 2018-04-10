import { TestBed, inject } from '@angular/core/testing';

import { StoredCardsService } from './stored-cards.service';

describe('StoredCardsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StoredCardsService]
    });
  });

  it('should be created', inject([StoredCardsService], (service: StoredCardsService) => {
    expect(service).toBeTruthy();
  }));
});
