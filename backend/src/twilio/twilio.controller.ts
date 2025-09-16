import { Controller, Post, Body, Res, HttpStatus, UseInterceptors, UploadedFile } from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { TwilioService } from './twilio.service';

interface TwilioVoiceRequest {
    CallSid: string;
    From: string;
    To: string;
    CallStatus: string;
    RecordingUrl?: string;
}

@Controller('twilio')
export class TwilioController {
    constructor(private twilioService: TwilioService) { }

    @Post('voice/incoming')
    async handleIncomingCall(
        @Body() body: TwilioVoiceRequest,
        @Res() res: Response,
    ) {
        console.log('📞 Incoming call webhook:', body);

        try {
            const twiml = await this.twilioService.handleIncomingCall(
                body.CallSid,
                body.From,
            );

            res.set('Content-Type', 'text/xml');
            res.status(HttpStatus.OK).send(twiml);
        } catch (error) {
            console.error('Error handling incoming call:', error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Error');
        }
    }

    @Post('voice/process')
    async processVoiceRecording(
        @Body() body: TwilioVoiceRequest,
        @Res() res: Response,
    ) {
        console.log('🎵 Voice recording webhook:', body);

        try {
            const twiml = await this.twilioService.processVoiceRecording(
                body.CallSid,
                body.RecordingUrl,
            );

            res.set('Content-Type', 'text/xml');
            res.status(HttpStatus.OK).send(twiml);
        } catch (error) {
            console.error('Error processing voice recording:', error);
            res.set('Content-Type', 'text/xml');
            res.status(HttpStatus.OK).send(this.twilioService.generateErrorTwiML());
        }
    }

    @Post('voice/process-web')
    @UseInterceptors(FileInterceptor('audio'))
    async processWebVoiceRecording(
        @UploadedFile() audioFile: Express.Multer.File,
        @Body() body: { sessionId: string; restaurantId: string },
        @Res() res: Response,
    ) {
        console.log('🎵 Web voice recording received:', {
            sessionId: body.sessionId,
            restaurantId: body.restaurantId,
            fileSize: audioFile?.size
        });

        try {
            if (!audioFile) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    error: 'No audio file provided'
                });
            }

            const result = await this.twilioService.processWebVoiceRecording(
                audioFile,
                body.sessionId,
                body.restaurantId
            );

            res.status(HttpStatus.OK).json({
                success: true,
                transcription: result.transcription,
                response: result.response
            });
        } catch (error) {
            console.error('Error processing web voice recording:', error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: 'Failed to process voice recording'
            });
        }
    }
}