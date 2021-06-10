## Load Libraries
library(ghql)
library(jsonlite)
library(tidyverse)
library(lubridate)

## Initialize Client Connection
con <- GraphqlClient$new("https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2")

## Prepare New Query
qry <- Query$new()

## Add Position data query
qry$query('swaps_data',
	'query swaps_data($pair: String!,$timestamp: Int!)
	{
		swaps(where: {pair: $pair,timestamp_lt:$timestamp},orderBy: timestamp,orderDirection: desc,first:1000) 
		{
			amountUSD
			amount0In
			amount0Out
			amount1In
			amount1Out
			timestamp
		}
	}'
)
pair_add = "0x92c2fc5f306405eab0ff0958f6d85d7f8892cf4d"
swap_data <- data.frame()
n_skip <- 0
c_timestamp <- as.integer(Sys.time())
while(TRUE)
{
	swap_data_t <- fromJSON(con$exec(qry$queries$swaps_data, list(pair = pair_add,timestamp=c_timestamp)))$data$swaps
	rownames(swap_data_t) <- as.character(nrow(swap_data)+(1:nrow(swap_data_t)))
	swap_data <- do.call(rbind,list(swap_data,swap_data_t))
	if(nrow(swap_data_t)<1000) break()
	c_timestamp <- as.numeric(tail(swap_data$timestamp,1))
	message(nrow(swap_data))
}
swap_data$amountUSD <- as.numeric(swap_data$amountUSD)
swap_data$Time <- as_datetime(as.numeric(swap_data$timestamp))
swap_data <- swap_data[order(swap_data$Time),]
swap_data$Date <- as_datetime(format(swap_data$Time,"%Y-%m-%d"))
swap_data$Weekday <- format(swap_data$Date,"%w")

## Events DF
events <- data.frame(
                        start = as_datetime(c("2021-01-18","2021-02-24")),
                        end = as_datetime(c("2021-01-21","2021-03-02")),
                        name = c("Titlis Testnet","Jungfrau Launch")
                    )
events <- events[2,]

## Derive Daily data
swap_data_d <- swap_data %>%
	group_by(Date) %>%
	summarise(
				Txs = length(amountUSD),
				amountUSD = sum(amountUSD)				
			)
swap_data_d$Weekday <- format(swap_data_d$Date,"%w")

## Line Plot Cummulative per day
# plot(swap_data_d$Date,swap_data_d$amountUSD,type="l",xlab="Day",ylab="Trade Volume USD")
# abline(v=as.POSIXct("2021-01-18"),col="red")
# abline(v=as.POSIXct("2021-01-21"),col="red")
# abline(v=as.POSIXct("2021-02-24"),col="blue")
# abline(v=as.POSIXct("2021-03-02"),col="blue")
# legend("topright",legend = c("Titlis","Jungfrau"),col=c("red","blue"),pch=19)
ggplot() +
    geom_rect(aes(xmin = start,xmax = end,ymin = 0, ymax = Inf,fill = name),data = events,show.legend = F)+
    geom_text(aes(x = start,y = 7500000,label = name,angle = 90),data = events)+
    geom_line(data=swap_data_d, aes(x=Date, y=amountUSD)) + 
    geom_point() +
    scale_x_datetime(date_breaks = "months" , date_labels = "%b-%y")+
    labs(x = "Time", y = "HOPR-DAI Pool Swaps in USD", title = "Time Series of HOPR-DAI Pool Swaps")
ggsave("uniswap_plot/Uniswap_Volume_Over_Time.png", dpi = 300, width = 8, height = 6)


## Box plot including event data
data_p1 <- swap_data_d %>%
    group_by(Weekday) %>%
    summarise(Med = median(amountUSD))
data_p2 <- swap_data_d %>%
    select(Weekday, amountUSD) %>%
    left_join(data_p1) %>%
    mutate(Weekday = factor(Weekday, labels = c("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday")))
ggplot(data = data_p2, aes(x = Weekday, y = amountUSD)) +
    geom_boxplot(aes(fill = Med)) +
    scale_y_log10() +
    scale_fill_gradient2("Median", low = "red4", mid = "white", high = "green4") +
    labs(
        title = "Weekday Wise Trade Volume USD",
        subtitle = "Data starting from 28-Feb-2021",
        x = "Weekday",
        y = "HOPR-DAI Pool Swaps in USD"
    )
ggsave("uniswap_plot/Uniswap_Volume_Weekday_Wise.png", dpi = 300, width = 8, height = 6)




