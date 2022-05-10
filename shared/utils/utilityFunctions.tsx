


export function calculateProductLongevityInDays(purchaseDate:string, requiredReplacementDate:string): number | undefined {

    let numberOfSecondsInADay = (24*60*60)

    let purchaseDateAsUnixTimeStamp = Date.parse(purchaseDate)
    let replacementDateAsUnixTimeStamp = Date.parse(requiredReplacementDate)
    let productLifeSpanInSeconds = (replacementDateAsUnixTimeStamp - purchaseDateAsUnixTimeStamp)/1000

     if (   (purchaseDate === '') ||
            (requiredReplacementDate === '') ||
            (Number.isNaN(purchaseDateAsUnixTimeStamp)) ||
            (Number.isNaN(replacementDateAsUnixTimeStamp)) ||
            productLifeSpanInSeconds < 0
         ) { return undefined } 

    let productLifeSpanInDays = Math.floor(productLifeSpanInSeconds/numberOfSecondsInADay)

    return (
             productLifeSpanInDays
            )

}

