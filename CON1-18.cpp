#include <bits/stdc++.h>
using namespace std;

using ll = long long;

int main(){
    ll n, s; cin >> n >> s;
    vector<ll> a(n);
    for(int i = 0; i < n; i++) cin >> a[i];
    sort(a.begin(), a.end());
    int sum = 0;
    for(int i=n-1; i>=0; i--){
        while(s >= a[i]){
            s -= a[i];
            sum++;
        }
    }
    cout << sum << endl;
    return 0;
}