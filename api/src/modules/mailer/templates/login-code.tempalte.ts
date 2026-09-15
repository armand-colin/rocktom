export const LoginCodeTemplate = (args: { code: string }) => /* html */`

Your login code is: <br/>
<div style="width: 100%; display: flex; justify-content: center; align-items: center; margin-top: 24px;">
    <span style="font-size: 24px; font-weight: bold; padding: 24px; background: #f0f0f0; border-radius: 12px;">${args.code}</span>
</div>

`