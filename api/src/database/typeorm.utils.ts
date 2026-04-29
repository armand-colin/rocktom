import { QueryFailedError } from "typeorm";

export namespace TypeORMUtils {

    function _getCode(error: QueryFailedError): { code: string, constraint: string } {
        const drv: any = (error as any).driverError;
        const code = drv.code || drv.errno || drv.name; // pg | mysql | generic
        const constraint = drv.constraint; // pg
        return { code, constraint };
    }

    export function isConflictError(error: any): boolean {
        const { code } = _getCode(error);
        return code === '23505';
    }

}