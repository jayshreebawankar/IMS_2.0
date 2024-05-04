async function generateRackPartitions(rackNo, partitionCount) {
    function getPartitionName(partitionNumber) {
        let result = '';
        while (partitionNumber > 0) {
            const remainder = (partitionNumber - 1) % 26;
            result = String.fromCharCode('A'.charCodeAt(0) + remainder) + result;
            partitionNumber = Math.floor((partitionNumber - 1) / 26);
        }
        return result;
    }

    const partitions = [];

    for (let i = 0; i < partitionCount; i++) {
        const partitionName = getPartitionName(rackNo);
        partitions.push({ partitionName: `${partitionName}${i + 1}`, isRackFilled: false });
    }

    return partitions;
}

module.exports = generateRackPartitions;
