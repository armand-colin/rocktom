export type DataProps = Record<string, any>

export namespace DataProps {

    export function toNativeProps(data: DataProps): Record<string, any> {
        const props: Record<string, any> = {}
        for (const [key, value] of Object.entries(data)) {
            props['data-' + key] = value
        }
        return props
    }
    
}