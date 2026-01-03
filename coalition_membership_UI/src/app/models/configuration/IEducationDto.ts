export interface IEducationalFieldPostDto{

    id?:string,
    educationalFieldName : string, 
    remark : string, 
    createdById?:string
    
}

export interface IEducationalFieldGetDto {

    id : string ,
    educationalFieldName : string,
    remark : string  

}

export interface IEducationalLevelPostDto{

    id?:string,
    educationalLevelName : string, 
    remark : string, 
    createdById?:string
    
}

export interface IEducationalLevelGetDto {

    id : string ,
    educationalLevelName : string,
    remark : string  

}



