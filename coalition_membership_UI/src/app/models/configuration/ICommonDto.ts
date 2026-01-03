export interface IGeneralCodeDto {

    id?: string;
    associationId?: string;
    generalCode: string;
    initialName: string;
    pad: number;
    currentNumber: number;

}

export interface IGeneralCodeUpsertDto {
    id?: string | null;
    generalCodeType: number; // EnumList.GeneralCodeType (0=MEMBERPREFIX, 1=TASKPREFIX)
    initialName: string;
    pad: number;
    currentNumber: number;
    associationId: string;
    createdById?: string | null;
}