import { Accounts, ApolloAccountQuery, ApolloChannelQuery, Channels, Dataset } from "../types";

export function datasetBuilderAccount(query: ApolloAccountQuery, dataset: Dataset): Dataset {
    dataset.nodes = dataset.nodes.concat(...query.accounts)
    console.log("Dataset: ", dataset)
    return dataset
}

export function datasetBuilderChannel(query: ApolloChannelQuery, dataset: Dataset): Dataset {
    dataset.edges = dataset.edges.concat(...query.channels)
    console.log("Dataset: ", dataset)
    return dataset
}