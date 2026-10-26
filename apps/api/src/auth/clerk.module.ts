import { Global, Module } from '@nestjs/common';
import { CLERK_CLIENT, clerkClientProvider } from './clerk.provider.js';

@Global()
@Module({
  providers: [clerkClientProvider],
  exports: [CLERK_CLIENT],
})
export class ClerkModule {}
