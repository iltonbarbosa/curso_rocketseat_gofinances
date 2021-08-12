import React, { useEffect, useCallback, useState } from 'react';
import { HighLightCard } from '../../components/HighlightCard';
import { TransactionCard, TransactionCardProps } from '../../components/TransactionCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native';

import { useTheme } from 'styled-components';

import { Container, 
		 Header,
		 UserWrapper,
		 UserInfor,
		 Photo,
		 User,
		 UserGreeting,
		 UserName,
		 Icon,
		 HighLightCards,
		 Transactions,
		 Title,
		 TransactionsList,
		 LogoutButton,
		 LoadContainer
		 } from './styles';	 
import { useAuth } from '../../hooks/auth';

export interface DataListProps extends TransactionCardProps{
	id: string;
}		 

interface HighLightProps {
	amount: string;
	lastTransaction: string;
}		 

interface HighLightData {
	entries: HighLightProps;
	expensives: HighLightProps;
	total:HighLightProps;
}		 

export function Dashboard(){
	const [isLoading, setIsloading] = useState(true);
	const [transactions, setTransactions] = useState<DataListProps[]>([]);
	const [highLightData, setHighLightData] = useState<HighLightData>({} as HighLightData);

	const theme = useTheme();
	const { signOut } = useAuth();

	function getLastTransactionDate( 
			collection: DataListProps[],
			type: 'positive' | 'negative'
			){
		const lastTransaction = new Date(
			Math.max.apply(Math, collection
			.filter(
				(transaction) => transaction.type === type)
				.map((transaction) => new Date(transaction.date)
				.getTime()))
			);

		return `${lastTransaction.getDate()} de ${lastTransaction.toLocaleString('pt-BR', { month: 'long'})}`
	}

	async function loadTransactions(){
		const dataKey = '@gofinances:transactions';
		const response = await AsyncStorage.getItem(dataKey);
		const transactions = response ? JSON.parse(response) : [];

		let entriesTotal = 0;
		let expensivesTotal = 0;

		const transactionsFormatted: DataListProps[] = transactions
			.map((item: DataListProps) => {

				if(item.type === 'positive'){
					entriesTotal += Number(item.amount);
				}else{
					expensivesTotal += Number(item.amount);
				}


				const amount = Number(item.amount)
					.toLocaleString('pr-BR', {
						style: 'currency',
						currency: 'BRL'
					});
				
				const date = Intl.DateTimeFormat('pt-BR', {
					day: '2-digit',
					month: '2-digit',
					year: '2-digit'
				}).format(new Date(item.date));	

				return {
					id: item.id,
					name: item.name,
					amount,
					type: item.type,
					category: item.category,
					date
				}
			});

			setTransactions(transactionsFormatted);

			const lastTransactionsEntries = getLastTransactionDate(transactions, 'positive');
			const lastTransactionsExpensives	 = getLastTransactionDate(transactions, 'negative');
			const totalInterval = `01 a ${lastTransactionsExpensives}`;		

			const total = entriesTotal - expensivesTotal;

			setHighLightData({
				entries:{
					amount: entriesTotal.toLocaleString('pt-BR', { 
						style: 'currency',
						currency: 'BRL'
					}),
					lastTransaction: `Última entrada dia ${lastTransactionsEntries}`
				},
				expensives: {
					amount: expensivesTotal.toLocaleString('pt-BR', { 
						style: 'currency',
						currency: 'BRL'
					}),
					lastTransaction: `Última saída dia ${lastTransactionsExpensives}`
				},
				total: {
					amount: total.toLocaleString('pt-BR', { 
						style: 'currency',
						currency: 'BRL'
					}),
					lastTransaction: totalInterval
				}
			});

			setIsloading(false);
	}

	useEffect(() => {
		loadTransactions();

	//Para limpar o AsyncStorare descomente estas linhas e salve o arquivo.
	//const dataKey = '@gofinances:transactions';
	//	AsyncStorage.removeItem(dataKey);
	},[]);

	useFocusEffect(useCallback(() => {
		loadTransactions();
	},[]));

	return (
		<Container>
			{
				isLoading ? 
					<LoadContainer>
						<ActivityIndicator 
							color={theme.colors.primary}
							size="large" 
						/>
					</LoadContainer> :
			<>	
				<Header>
					<UserWrapper>
						<UserInfor>
							<Photo source={{ uri: 'https://avatars.githubusercontent.com/u/4026942?v=4'}} />
							<User>
								<UserGreeting>Olá,</UserGreeting>
								<UserName>Ilton</UserName>
							</User>
						</UserInfor>

					<LogoutButton onPress={signOut}>
							<Icon name="power"/>
					</LogoutButton>	
					</UserWrapper>
				</Header>
				<HighLightCards>
					<HighLightCard 
						type="up"
						title="Entradas"
						amount={highLightData.entries.amount}
						lastTransaction={highLightData.entries.lastTransaction}/>
					<HighLightCard
						type="down"
						title="Saídas"
						amount={highLightData.expensives.amount}
						lastTransaction={highLightData.expensives.lastTransaction}
					/>
					<HighLightCard
						type="total"
						title="Total"
						amount={highLightData.total.amount}
						lastTransaction={highLightData.total.lastTransaction}
					/>
				</HighLightCards>

				<Transactions>
					<Title>Listagem</Title>
					<TransactionsList 
						data={transactions}
						keyExtractor={item => item.id}
						renderItem={({ item }) =>
						<TransactionCard
							data={item}	/>} 
					/>
					
				</Transactions>
			</>
			}
		</Container>
	)
}


