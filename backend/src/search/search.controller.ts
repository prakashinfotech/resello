import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { SearchService } from './search.service';
import { FindAdsDto } from '../ads/dto';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search ads with filters' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated search results',
  })
  async search(@Query() query: FindAdsDto) {
    return this.searchService.search(query);
  }

  @Get('autocomplete')
  @SkipThrottle()
  @ApiOperation({ summary: 'Get autocomplete suggestions' })
  @ApiResponse({
    status: 200,
    description: 'Returns array of suggested search terms',
    type: [String],
  })
  async autocomplete(@Query('term') term: string): Promise<string[]> {
    return this.searchService.autocomplete(term);
  }
}
