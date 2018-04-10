import { TestBed, inject } from '@angular/core/testing';

import { CardIndexService } from './card-index.service';

describe('CardIndexService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CardIndexService]
    });
  });

  it('should be created', inject([CardIndexService], (service: CardIndexService) => {
    expect(service).toBeTruthy();
  }));
});
