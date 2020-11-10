let performanceObj: any = {};

performanceObj.now = function() {
    // @ts-ignore
    // if (global.nativePerformanceNow !== undefined)
    // @ts-ignore
    return global.nativePerformanceNow();
    // else
    //    return Date.now();
}

performanceObj.mark = function (markName: string) {
    console.log(`performance: mark ${markName}`);
}

performanceObj.measure = function(measureName: string, startMark: string, endMark: string) {
    console.log(`performance: measure ${measureName} ${startMark} ${endMark}`);
}

performanceObj.clearMarks = function(markName: string) {
    console.log(`performance: clearMarks ${markName}`);
}

performanceObj.clearMeasures = function()  {
    console.log(`performance: clearMeasures`);
}

export const PERF = performanceObj;