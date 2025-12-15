import { MagnetizationView } from "./MagnetizationView";
export default {
    title: "MagnetizationView",
}

export const Template = () => {
    return <>
        <style>{`
            .container {

            }
        `}</style>

        <div className="container">
            <MagnetizationView />
        </div>
    </>
}
