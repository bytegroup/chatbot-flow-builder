import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FlowsController } from './flows.controller';
import { FlowsService } from './flows.service';
import { FlowValidatorService } from './validators/flow-validator.service';
import { Flow, FlowSchema } from './schemas/flow.schema';
import { FlowVersion, FlowVersionSchema } from './schemas/flow-version.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Flow.name, schema: FlowSchema },
      { name: FlowVersion.name, schema: FlowVersionSchema },
    ]),
  ],
  controllers: [FlowsController],
  providers: [FlowsService, FlowValidatorService],
  exports: [FlowsService, MongooseModule], // Export for use in Chat module
})
export class FlowsModule {}
