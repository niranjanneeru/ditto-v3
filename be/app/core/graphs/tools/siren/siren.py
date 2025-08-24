from app.core.config import settings

class SirenMCPClient:
    def call_tool(self, to, subject, body):
        from siren import SirenClient

        client = SirenClient(api_key=settings.SIREN_API_KEY)

        message_id = client.message.send(
            recipient_value=to,
            channel="EMAIL",
            body=body,
            subject=subject
        )
        return message_id

client = SirenMCPClient()
