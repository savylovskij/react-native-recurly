import {Text, View} from "react-native";
import {useLocalSearchParams} from "expo-router/build/hooks";
import {Link} from "expo-router";

const SubscriptionDetails = () => {
    const {id} = useLocalSearchParams<{id: string}>()

    return (
        <View>
            <Text>Subscription Details: {id}</Text>
            <Link href="/">Go back</Link>
        </View>
    )
}

export default SubscriptionDetails
